exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE platform_metadata (
      singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
      value text NOT NULL
    );
    INSERT INTO platform_metadata (value) VALUES ('BorrowBench');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('platform_metadata');
};
