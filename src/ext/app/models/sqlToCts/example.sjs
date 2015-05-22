var sqlToCts = require("sqlToCts.sjs")
var sql = "SELECT * FROM temperatures WHERE city='Derby' LIMIT 2"     
var query = sqlToCts.convert("SELECT * FROM temperatures WHERE city='Derby' LIMIT 2")
var res =  sqlToCts.search(query[0], query[1])
sqlToCts.format(res,query[0], sql, query[1])
