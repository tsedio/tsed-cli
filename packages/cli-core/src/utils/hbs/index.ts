import handlebars from "handlebars";

import {helpers as array} from "./array.js";
import {helpers as collection} from "./collection.js";
import {helpers as comparison} from "./comparison.js";
import {helpers as object} from "./object.js";
import {helpers as switchHelpers} from "./switch.js";

handlebars.registerHelper(array);
handlebars.registerHelper(object);
handlebars.registerHelper(collection);
handlebars.registerHelper(comparison);
handlebars.registerHelper(switchHelpers);
