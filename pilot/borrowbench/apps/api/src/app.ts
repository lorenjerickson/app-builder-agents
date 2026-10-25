import 'reflect-metadata';
import {
  ArgumentsHost, CanActivate, Catch, Controller, ExceptionFilter, ExecutionContext,
  ForbiddenException, Get, Post, Put, Param, Query, Body, Res, HttpException, Inject, Injectable, Module, Req,
  ServiceUnavailableException, UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import pg from 'pg';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Account, Config } from './config.js';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Business } from './business.js';
import { operationForPath, telemetry } from './telemetry.js';
import { BusinessError, command, messages, operationKey, queryFields, uuid } from './business-contract.js';

interface Request { url: string; method: string; requestId: string; correlationId?: string; operationId?: string; safeCode?: string; headers: Record<string, string | string[] | undefined>; identity?: Account & { subject: string } }
interface Response { status(code: number): Response; json(body: unknown): void; setHeader(name: string, value: string): void }
const CONFIG = Symbol('CONFIG');
const LOCAL_ACCOUNTS = new Map<string, Account>([
  ['member-a', { label: 'Member A', role: 'member' }],
  ['member-b', { label: 'Member B', role: 'member' }],
  ['custodian', { label: 'Custodian', role: 'custodian' }],
]);
@Injectable()
class Database {
  readonly pool: pg.Pool;
  constructor(@Inject(CONFIG) readonly config: Config, pool?: pg.Pool) {
    this.pool = pool ?? new pg.Pool({ connectionString: config.databaseUrl, max: 5,
      connectionTimeoutMillis: 2000, query_timeout: 3000, statement_timeout: 3000 });
    // An idle client failure must not leak connection details or terminate the API.
    this.pool.on('error', () => process.stderr.write('{"event":"database_connection_error"}\n'));
  }
  async marker(): Promise<string> {
    try {
      const result = await this.pool.query<{ value: string }>('SELECT value FROM public.platform_metadata WHERE singleton = true');
      if (result.rows.length !== 1 || result.rows[0].value !== 'BorrowBench') throw new Error('Invalid scaffold');
      return result.rows[0].value;
    } catch { throw new ServiceUnavailableException(); }
  }
  async ready(): Promise<string> {
    try {
      await this.pool.query('SELECT id FROM accounts LIMIT 0');
      await this.pool.query('SELECT canonical_intent,outcome FROM operations LIMIT 0');
      await this.pool.query('SELECT id FROM equipment LIMIT 0');
      await this.pool.query('SELECT id FROM loans LIMIT 0');
      await this.pool.query('SELECT id FROM audit_events LIMIT 0');
      const privileges=await this.pool.query("SELECT has_table_privilege(current_user,'audit_events','UPDATE') OR has_table_privilege(current_user,'audit_events','DELETE') AS unsafe");
      if (privileges.rows[0].unsafe) throw new Error('Unsafe runtime privileges');
      telemetry(this.config,'db_ready',{value:1});
    } catch { telemetry(this.config,'db_ready',{value:0});throw new ServiceUnavailableException(); }
    return this.marker();
  }
  async onModuleDestroy() { await this.pool.end(); }
}
@Injectable()
class IdentityGuard implements CanActivate {
  private readonly jwks;
  constructor(@Inject(CONFIG) private readonly config: Config) {
    this.jwks = createRemoteJWKSet(config.jwksUrl, { timeoutDuration: 3000, cooldownDuration: 30000, cacheMaxAge: 600000 });
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (typeof header !== 'string' || !/^Bearer [^\s]+$/i.test(header)) throw new UnauthorizedException();
    if ((this.config.authMode === 'local' || this.config.authMode === 'container-test')) {
      // Compare fixed-size digests to avoid leaking key bytes or prefix matches.
      const digest = (value: string) => createHash('sha256').update(value).digest();
      if (!this.config.localAuthKey || !timingSafeEqual(digest(header.slice(7)), digest(this.config.localAuthKey))) {
        throw new UnauthorizedException();
      }
      const id = req.headers['x-borrowbench-local-account'];
      const account = typeof id === 'string' ? LOCAL_ACCOUNTS.get(id) : undefined;
      if (!account) throw new ForbiddenException();
      req.identity = { subject: `local|${id}`, ...account };
      return true;
    }
    let subject: string;
    try {
      const { payload } = await jwtVerify(header.slice(7), this.jwks, {
        issuer: this.config.issuer, audience: this.config.audience, algorithms: ['RS256'],
        requiredClaims: ['sub', 'exp', 'iat'],
      });
      if (typeof payload.sub !== 'string' || !payload.sub) throw new Error('Invalid subject');
      subject = payload.sub;
    } catch { throw new UnauthorizedException(); }
    const account = this.config.accounts.get(subject);
    if (!account) throw new ForbiddenException();
    req.identity = { subject, ...account };
    return true;
  }
}
@Injectable()
class CustodianGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (context.switchToHttp().getRequest<Request>().identity?.role !== 'custodian') throw new ForbiddenException();
    return true;
  }
}
@Controller()
class PlatformController {
  constructor(private readonly database: Database) {}
  @Get('health/live') live() { return { status: 'ok' }; }
  @Get('health/ready') async ready() { return { status: 'ready', platform: await this.database.ready() }; }
  @Get('me') @UseGuards(IdentityGuard)
  async me(@Req() req: Request) { return { ...req.identity!, platform: await this.database.marker() }; }
  @Get('admin/platform') @UseGuards(IdentityGuard, CustodianGuard)
  async admin() { return { platform: await this.database.marker() }; }
}
@Controller('v1')
@UseGuards(IdentityGuard)
class BusinessController {
  private readonly business: Business;
  constructor(private readonly database: Database) { this.business = new Business(database.pool,database.config); }
  private actor(req: Request) { return this.business.principal(req.identity!.subject, req.identity!.role); }
  @Get('equipment')
  async equipment(@Req() req: Request, @Query() q: Record<string, unknown>) { req.operationId='listEquipment';return this.business.equipment(await this.actor(req),q); }
  @Get('equipment/:itemId')
  async item(@Req() req: Request,@Param('itemId') id: string,@Query() q: Record<string, unknown>) { req.operationId='getEquipment';uuid(id,'itemId');return this.business.equipment(await this.actor(req),q,id); }
  @Get('loans/mine')
  async mine(@Req() req: Request,@Query() q: Record<string, unknown>) { req.operationId='listMyLoans';return this.business.ownLoans(await this.actor(req),q); }
  @Get('loans/:loanId')
  async loan(@Req() req: Request,@Param('loanId') id: string,@Query() q: Record<string, unknown>) { req.operationId='getOwnLoan';uuid(id,'loanId');return this.business.ownLoan(await this.actor(req),id,q); }
  @Get('audit-events') @UseGuards(CustodianGuard)
  async audit(@Req() req: Request,@Query() q: Record<string, unknown>) { req.operationId='listAuditEvents';return this.business.audit(await this.actor(req),q); }
  @Get('operations/lookup')
  async lookup(@Req() req: Request,@Query() q: Record<string, unknown>) {
    req.operationId='lookupOperation';queryFields(q,[]);const key=operationKey(req.headers['idempotency-key']);
    return {...await this.business.lookup(await this.actor(req),key),requestId:req.requestId};
  }
  @Post('equipment/:itemId/checkout')
  async checkout(@Req() req: Request,@Res() res: Response,@Param('itemId') id: string,@Body() body: unknown,@Query() q: Record<string, unknown>) {
    req.operationId='checkoutEquipment';return this.mutate(req,res,'checkout',id,body,q);
  }
  @Post('loans/:loanId/return')
  async returnLoan(@Req() req: Request,@Res() res: Response,@Param('loanId') id: string,@Body() body: unknown,@Query() q: Record<string, unknown>) {
    req.operationId='returnOwnLoan';return this.mutate(req,res,'return',id,body,q);
  }
  @Put('equipment/:itemId/maintenance') @UseGuards(CustodianGuard)
  async maintenance(@Req() req: Request,@Res() res: Response,@Param('itemId') id: string,@Body() body: unknown,@Query() q: Record<string, unknown>) {
    req.operationId='setMaintenance';return this.mutate(req,res,'set_maintenance',id,body,q);
  }
  private async mutate(req: Request,res: Response,type: 'checkout'|'return'|'set_maintenance',id: string,body: unknown,q: Record<string, unknown>) {
    queryFields(q,[]);
    if (typeof req.headers['content-type'] !== 'string' || !/^application\/json(?:\s*;.*)?$/i.test(req.headers['content-type'])) throw new BusinessError('INVALID_REQUEST',400);
    const key=operationKey(req.headers['idempotency-key']);const cmd=command(type,id,body);
    const result=await this.business.mutate(await this.actor(req),key,cmd,req.correlationId??req.requestId);
    req.safeCode=result.operation.code;
    telemetry(this.database.config,'operation_outcome_total',{type,code:result.operation.code,changed:result.operation.changed,replay:result.replay,requestId:req.requestId});
    res.status(result.httpStatus).json(result.httpStatus>=400 ? {error:{code:result.operation.code,message:messages[result.operation.code],requestId:req.requestId},operation:result.operation} : {operation:result.operation,requestId:req.requestId});
  }
}
@Catch()
class SafeErrors implements ExceptionFilter {
  constructor(private readonly config: Config) {}
  catch(error: unknown, host: ArgumentsHost) {
    const req=host.switchToHttp().getRequest<Request>();
    const res=host.switchToHttp().getResponse<Response>();
    if (req.url.split('?')[0].startsWith('/v1/')) {
      const rawStatus=error instanceof HttpException ? error.getStatus() : (error as {status?:number})?.status;
      const status=rawStatus && [400,401,403,404,409,413].includes(rawStatus) ? rawStatus : 503;
      const code=error instanceof BusinessError ? error.code : ({400:'INVALID_REQUEST',401:'SESSION_REQUIRED',403:'FORBIDDEN',404:'NOT_FOUND',413:'PAYLOAD_TOO_LARGE'} as Record<number,string>)[status] ?? (['POST','PUT'].includes(req.method)?'OPERATION_UNRESOLVED':'SERVICE_UNAVAILABLE');
      req.safeCode=code;
      if (['POST','PUT'].includes(req.method)) telemetry(this.config,'operation_outcome_total',{operationId:req.operationId,code,changed:false,replay:false,terminal:false,requestId:req.requestId});
      res.status(status).json({error:{code,message:messages[code],requestId:req.requestId,...(error instanceof BusinessError && error.fieldErrors ? {fieldErrors:error.fieldErrors} : {})}});
      return;
    }
    const status = error instanceof HttpException ? error.getStatus() : 500;
    const code = ({ 401: 'unauthorized', 403: 'forbidden', 404: 'not_found', 503: 'unavailable' } as Record<number, string>)[status] ?? 'request_failed';
    req.safeCode=code;
    res.status(status).json({ error: code });
  }
}
export async function createApp(config: Config, options: {pool?:pg.Pool} = {}) {
  @Module({ controllers: [PlatformController,BusinessController], providers: [
    { provide: CONFIG, useValue: config }, {provide:Database,useFactory:()=>new Database(config,options.pool)}, IdentityGuard, CustodianGuard,
  ] })
  class AppModule {}
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false,bodyParser:false });
  app.use((req: Request, res: Response & {statusCode:number;on(event:string,cb:()=>void):void}, next: (error?:unknown) => void) => {
    req.requestId=randomUUID();req.operationId=operationForPath(req.method,req.url);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Request-Id', req.requestId);
    const started=performance.now();
    res.on('finish',()=>{
      const dimensions={operationId:req.operationId,status:res.statusCode,code:req.safeCode??(res.statusCode<400?'OK':'REQUEST_FAILED'),requestId:req.requestId};
      telemetry(config,'api_request_total',{...dimensions,value:1});
      telemetry(config,'api_duration_ms',{...dimensions,value:performance.now()-started});
    });
    if (req.url.split('?')[0].startsWith('/v1/') && req.headers['x-correlation-id'] !== undefined) {
      try { req.correlationId=uuid(req.headers['x-correlation-id'],'X-Correlation-ID'); } catch(error) { next(error);return; }
    }
    next();
  });
  app.useBodyParser('json',{limit:8192,strict:true});
  app.useGlobalFilters(new SafeErrors(config));
  app.enableShutdownHooks();
  return app;
}
