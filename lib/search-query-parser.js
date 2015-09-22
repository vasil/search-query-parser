/*!
 * search-query-parser.js
 * Copyright(c) 2014 Julien Buty <julien@nepsilon.net>
 * MIT Licensed
 */

var parse = function(string, options) {

  // Set an empty options object when none provided
  if (!options) {
    options = {};
  }

  // Regularize white spacing
  // Make in-between white spaces a unique space
  string = string.trim().replace(/\s+/g, ' ');

  // When a simple string, return it
  if (-1 === string.indexOf(':')) {
    return string;
  }
  // When no keywords or ranges set, treat as a simple string
  else if (!options.keywords && !options.ranges){
    return string;
  }
  // Otherwise parse the advanced query syntax
  else {
    // Our object to store the query object
    var query = {text: []};
    // Get a list of search term. Reverse to ensure proper order when pop()'ing.
    var terms = string.split(' ').reverse();
    // For each search term
    while (term = terms.pop()) {
      // Advanced search terms syntax has key and value
      // separated with a colon
      var sepIdx = term.indexOf(':');
      // When just a simple term
      if (-1 === sepIdx) {
        // We add it as pure text
        query.text.push(term);
      }
      // We got an advanced search syntax
      else {
        var key = term.slice(0, sepIdx);
        // Check if the key is a registered keyword
        options.keywords = options.keywords || [];
        var isKeyword = !(-1 === options.keywords.indexOf(key));
        // Check if the key is a registered range
        options.ranges = options.ranges || [];
        var isRange = !(-1 === options.ranges.indexOf(key));
        // When the key matches a keyword
        if (isKeyword) {
          var value = term.slice(sepIdx + 1);
          // When value is a thing
          if (value.length) {
            // Get an array of values when several are there
            var values = value.split(',');
            // If we already have seen that keyword...
            if (query[key]) {
              // ...many times...
              if (query[key] instanceof Array) {
                // ...and got several values this time...
                if (values.length > 1) {
                  // ... concatenate both arrays.
                  query[key] = query[key].concat(values);
                }
                else {
                  // ... append the current single value.
                  query[key].push(value);
                }
              }
              // We saw that keyword only once before
              else {
                // Put both the current value and the new
                // value in an array
                query[key] = [query[key]]
                query[key].push(value);
              }
            }
            // First time we see that keyword
            else {
              // ...and got several values this time...
              if (values.length > 1) {
                // ...add all values seen.
                query[key] = values;
              }
              // Got only a single value this time
              else {
                // Record its value as a string
                query[key] = value;
              }
            }
           }
        }
        // The key allows a range
        else if (isRange) {
          var value = term.slice(sepIdx + 1);
          // Range are separated with a dash
          var rangeValues = value.split('-');
          // When both end of the range are specified
          // keyword:XXXX-YYYY
          query[key] = {};
          if (2 === rangeValues.length) {
            query[key].from = rangeValues[0];
            query[key].to = rangeValues[1];
          }
          // When pairs of ranges are specified
          // keyword:XXXX-YYYY,AAAA-BBBB
          else if (!rangeValues.length % 2) {
          }
          // When only getting a single value,
          // or an odd number of values
          else {
            query[key].from = value;
          }
        }
        else {
          // We add it as pure text
          query.text.push(term);
        }
      }
    }

    // Concatenate all text terms if any
    if (query.text.length) {
      query.text = query.text.join(' ').trim();
    }
    // Just remove the attribute text when it's empty
    else {
      delete query.text;
    }

    // Return forged query object
    return query;

  }

};
