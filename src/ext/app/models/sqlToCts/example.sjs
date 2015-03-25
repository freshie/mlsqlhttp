var sqlToCts = require("/sqlToCts/sqlToCts.sjs")
    
sqlToCts.convert("SELECT table1.column1, UPPER(table2.column2) AS 'alias for column2' FROM table1 LEFT JOIN table2 ON `table1`.`id` = table2.id_table1 WHERE table2.column1 AND (table2.column2 != 5 OR table.column3 IS NOT NULL) ORDER BY table1.id ASC, table2.id DESC LIMIT 5;")