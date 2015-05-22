(function(exports){
	"use strict";
	var simpleSqlParser = require("lib/simpleSqlParser.sjs");

	/*
		Looks at where object to decide what to search over
	*/
	function buildWhere(WhereIn){
	  if (WhereIn.hasOwnProperty("logic")){
	    return buildWhereHelperTerms(WhereIn);
	  } else if (WhereIn.hasOwnProperty("operator")){
	  	return buildWhereHelperOperator(WhereIn);
	  } else {
	  	// at this point where is a string that is a colum name
	  	// we use a cts.elementQuery to make sure that the document has that colum in it
	    return  cts.elementQuery(WhereIn, cts.andQuery([]));
	  }
	}

	/*
	   loops throug the term array and calls buildWhere for each  item
	   adds the result of the function call to a new array
	   the new array gets wrapped in a logical cts query
	 */
	function buildWhereHelperTerms(WhereIn){
		var terms = [],
	    	numberOfTerms = WhereIn["terms"].length;

	    for (var i = 0; i < numberOfTerms; i++) {
	       terms.push(buildWhere(WhereIn["terms"][i]));
	    }

	    if (WhereIn["logic"] === "AND"){
	      return cts.andQuery(terms);
	    } else if (WhereIn["logic"] === "OR") {
	      return cts.orQuery(terms);
	    } else {
	      return cts.andQuery(terms);
	    }
	}

	/*
	   looks at the operator proporty to decided what type of cts query to use
	   looks at the  right proporty to decide what options to use
	 */
	function buildWhereHelperOperator(WhereIn){
		var value = WhereIn["right"];
		// checks to see if value is wrapped in quotes or double quotes
		// then removes 1st and last part of the string
		if (value.indexOf('"') === 0 || value.indexOf("'") === 0){
			value = value.substring(1, value.length - 1);
		}
		
		if (WhereIn["operator"] === "="){
	     return cts.elementValueQuery(WhereIn["left"], value);
	    } else if (WhereIn["operator"] === "!=" || WhereIn["operator"] === "IS NOT"){
	      return cts.notQuery(cts.elementValueQuery(WhereIn["left"], value));
	    } else if (WhereIn["operator"] === ">") {
	      return cts.elementRangeQuery(WhereIn["left"],">", value)
	    } else if (WhereIn["operator"] === "<") {
	      return cts.elementRangeQuery(WhereIn["left"],"<", value)
	    }

	}

	/*
	   looks at the first table and wrapps it into a collection query
	*/
	function buildFrom(FromIn){
		return cts.collectionQuery(FromIn[0]["table"]);
	}

	/*
		is the main function into this module
		It takes a sql string and passes it into simpleSqlParser
		simpleSqlParser gives us an object that we build a query out of
	*/
	function convert(sql){

		var sqlObjc = simpleSqlParser.sql2ast(sql)
			query = cts.andQuery([buildWhere(sqlObjc["WHERE"]),buildFrom(sqlObjc["FROM"])]);
	    return [query,sqlObjc];
	}

	/*
		Take the convert object and runs a cts search 
		uses the SQl part of the convert object to Limit the search
	*/
	function search(query, sqlObjc){
		if (sqlObjc.hasOwnProperty("LIMIT")){
			return fn.subsequence(cts.search(query), sqlObjc["LIMIT"]["from"] + 1, sqlObjc["LIMIT"]["nb"] )
		} else {
			return cts.search(query)
		}
		
	}

	/*
		Format the results into Json with some metadata
	*/
	function format(res, query, sql, sqlObjc){
		var data = [],
			metadata,
			results;

		
		metadata =	
	    {
	      "columns": {},
	      "sql": sql,
	      "sqlObjc": sqlObjc,
	      "cts:query": query
	    };
		
		results = 
		{
		  "metadata": metadata, 
		  "data": data
		};

		while (true) {
			var doc = res.next(),
				colnms,
				colnmsObj = {};
				
			if (doc.done == true){ 
			  break; 
			}

		    colnms = doc.value.root.xpath("//element()[fn:exists(text())]")
		    
		    while (true) {
		        var colnm = colnms.next(),
		        	localname,
		        	value
		         
		         if (colnm.done == true ){ 
		           break;
		         }

		        localname = fn.localName(colnm.value);
		        value = fn.string(colnm.value);

		        if (metadata["columns"].hasOwnProperty(localname) && metadata["columns"][localname].maxlength > value.length ){
		        
		        } else {
		           
		           metadata["columns"][localname] = {
		            maxlength: value.length
		          };

		        }
		        
		        colnmsObj[localname] = value;
		    }
		      
		   data.push(colnmsObj);
		};

		return results;
	}

	// Exports
	exports.convert = convert;
	exports.search = search;
	exports.format = format;

}(typeof exports === "undefined" ? (this.sqlToCts = {}) : exports));
