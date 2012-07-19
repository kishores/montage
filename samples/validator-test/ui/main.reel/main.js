/**
    @module "ui/main.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage,
    Converter = require("montage/core/converter/converter").Converter,
    Component = require("montage/ui/component").Component;

exports.TextValidator = Montage.create(Converter, {
    possibleValues: {
        value: null
    },
    
    convert: {
        value: function(value) {
            return value;
        }
    },
    revert: {
        value: function(value) {
            for(var i=0; i< this.possibleValues.length; i++) {
                if(this.possibleValues[i] === value) {
                    return value;
                }
            }
            throw new Error('Invalid text');
        }
    }

});

exports.Main = Montage.create(Component, /** @lends module:"ui/main.reel".Main# */ {

    thing: {
        value: "World"
    }

});
