(function(exports) {
	"use strict";
	var simpleSqlParser = require("lib/simpleSqlParser.js")

	function buildWhere(WhereIn)
	{
	  if(WhereIn.hasOwnProperty("logic")){
	    var terms = [];
	    var numberOfTerms = WhereIn["terms"].length;
	    for (var i = 0; i < numberOfTerms; i++) {
	       terms.push(buildWhere(WhereIn["terms"][i]))
	    }
	    
	    if(WhereIn["logic"] === "AND"){
	       return cts.andQuery(terms)
	    } else if (WhereIn["logic"] === "OR") {
	      return cts.orQuery(terms)
	    } else {
	           returncts.andQuery(terms)
	    }
	  } else if (WhereIn.hasOwnProperty("operator")){
	    if(WhereIn["operator"] === "="){  
	     return cts.elementValueQuery(WhereIn["left"], WhereIn["right"])
	    } else if (WhereIn["operator"] === "!=" || WhereIn["operator"] === "IS NOT"){
	      return cts.notQuery(cts.elementValueQuery(WhereIn["left"], WhereIn["right"]))
	    }
	        
	      
	  } else {
	    return  cts.elementQuery(WhereIn, cts.andQuery([]))
	  }
	}

	// Exports
	function convert(sql)
	{
		var sqlObjc = simpleSqlParser.sql2ast(sql)
		var query = cts.andQuery([
	    buildWhere(sqlObjc["WHERE"]),
	  	cts.collectionQuery(sqlObjc["FROM"][0]["table"])
	                         ])
	    return query
	}
	exports.convert = convert;

	
}(typeof exports === "undefined" ? (this.sqlToCts = {}) : exports));
