var sqlToCts = require("sqlToCts.sjs")
    
var query = sqlToCts.convert("SELECT * FROM temperatures WHERE city='Derby' LIMIT 2")

sqlToCts.search(query)
