import handlebars from "handlebars";
import {helpers as comparison} from "./comparison";
import {helpers as array} from "./array";
import {helpers as object} from "./object";
import {helpers as collection} from "./collection";
import {helpers as switchHelpers} from "./switch";

handlebars.registerHelper(array);
handlebars.registerHelper(object);
handlebars.registerHelper(collection);
handlebars.registerHelper(comparison);
handlebars.registerHelper(switchHelpers);
