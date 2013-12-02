(function(window, undefined){
	// General utilities
	var doc = window.document,
			$ = function(selector, context){
				context = context || doc;
				var result = context.querySelectorAll(selector);

				return (result.length > 1) ? result : result[0];
			};

	Node.prototype.on = Node.prototype.addEventListener;
	NodeList.prototype.on = function(type, func, flag) {
		[].forEach.call(this, function(node, index) {
			node.on(type, func, flag);
		});
	};

	// App related code goes here
	var command = $('#command'),
			output = $('.output'),
			commandCache = {},
			valuesCache = [],
			arrowCache = [];

	// Evaluator code here
	var Evaluator = function() {
		this.env = {};
		this.cons = cons;
	};

	Evaluator.prototype.evaluate = function(str) {
		try {
      str = rewriteDeclarations(str);
      var __environment__ = this.env;
      var console = this.cons;
      with (__environment__) {
        return JSON.stringify(eval(str));
      }
    } catch (e) {
      return e.toString();
    }
	};

	function rewriteDeclarations(str) {
    // Prefix a newline so that search and replace is simpler
    str = "\n" + str;

    str = str.replace(/\nvar\s+(\w+)\s*=/g, "\n__environment__.$1 =");  // (3)
    str = str.replace(/\nfunction\s+(\w+)/g, "\n__environment__.$1 = function");

    return str.slice(1); // remove prefixed newline
  }

	// Initializing the evaluator
	var cons = { log: function (m) { console.log("### "+m); return "### "+m; } };
	var evaluator = new Evaluator(cons);

	// Handling events to get results
	command.focus();

	command.on('keydown', function(e) {
		var value;
		if(e.keyCode == 13) {
			arrowCache.length = 0;
			index = -1;
			value = command.value;
			valuesCache.push(value);

			if(!commandCache[value]) {
				commandCache[value] = evaluator.evaluate(value);
			}

			output.innerHTML = '<li class="' + value + '">' + value + ' --> ' + commandCache[value] + '</li>' + output.innerHTML;
			command.value = '';
		} else if(e.keyCode == 38) {
			value =  valuesCache.pop();
			command.value = value;
			arrowCache.push(value);
		} else if(e.keyCode == 40) {
			arrowCache.length = arrowCache.length - 1;
			value = arrowCache.pop();
			command.value = value;
		}
	}, false);

}(this));