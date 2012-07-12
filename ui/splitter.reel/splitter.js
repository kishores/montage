/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var Montage = require("montage").Montage,
Component = require("ui/component").Component,
TranslateComposer = require("ui/composer/translate-composer").TranslateComposer;

exports.Splitter = Montage.create(Component, {

    /** horizontal or vertical */
    _axis: {value: null},
    axis: {
        get: function() {
            return this._axis;
        },
        set: function(value) {
            this._axis = value;
            this.needsDraw = true;
        }
    },

    /* Should the Splitter provide a drag handle to resize the panel */
    _resizable: {value: null},
    resizable: {
        get: function() {
            return this._resizable;
        },
        set: function(value) {
            this._resizable = value;
            this.needsDraw = true;
        }
    },
    
    minWidth: {
        value: null
    },
    
    maxWidth: {
        value: null
    },
    
    minHeight: {
        value: null
    },
    
    maxHeight: {
        value: null
    },


    // Private
    _composer: {value: null},

    _handlePositon: {value: null},

    _handleX: {value: null},
    handleX: {
        serializable: true,
        get: function() {
            return this._handleX;
        },
        set: function(value) {
            console.log('new handleposition x  - ' , value);
            this._handleX = value;

            if(!this._synching) {
                this._synching = true;
                this._percent = (value/this.containerWidth)*100;
                console.log('percent ', this._percent);
                this._synching = false;
            }

            this.needsDraw = true;
        }
   },

    _handleY: {value: null},
    handleY: {
        serializable: true,
        get: function() {
            return this._handleY;
        },
        set: function(value) {
            console.log('new handleposition y  - ' , value);
            this._handleY = value;

            if(!this._synching) {
                this._synching = true;
                this._percent = (value/this.containerHeight)*100;
                console.log('percent ', this._percent);
                this._synching = false;
            }

            this.needsDraw = true;
        }
   },

   __percent: {
       value: null
   },
   _percent: {
         get: function() {
             return this.__percent;
         },
         set: function(value) {
             this.__percent = value;
             if(!this._synching) {
                 this._calculatePositionFromPercent();
                 this.needsDraw = true;
             }
         }
     },


     _synching: {value: null},
     _calculatePositionFromPercent:{
         value: function() {
             this._synching = true;
             if("horizontal" === this.axis) {
                 var x = ((this._percent||0)/100) * this.containerWidth;
                 this.handleX = x;
                 console.log('calculate X from percent ', this.handleX);
             } else {
                 var y = ((this._percent||0)/100) * this.containerHeight;
                 this.handleY = y;
                 console.log('calculate Y from percent ', this.handleY);
             }

             this._synching = false;
         }
     },

   _containerWidth: {value: null},
   containerWidth: {
       get: function() {
           return this._containerWidth;
       },
       set: function(value) {
           this._containerWidth = value;
       }
   },

   _containerHeight: {value: null},
   containerHeight: {
       get: function() {
           return this._containerHeight;
       },
       set: function(value) {
           this._containerHeight = value;
       }
   },

    _wrappers: {
        value: null
    },


    _dragHandle: {value: null},


    _makeWrapper: {
        value: function(element) {
            var wrapper = document.createElement('div');
            wrapper.classList.add('montage-splitter-child');
            wrapper.appendChild(element);
            if(!this._wrappers) {
                this._wrappers = [];
            }
            this._wrappers.push(wrapper);
            return wrapper;
        }
    },

    _makeDragHandle: {
        value: function() {
            var handle = document.createElement('div');
            handle.classList.add('montage-splitter-thumb');
            this._dragHandle = handle;
            return handle;
        }
    },

    _getElementPosition: {
        value: function(obj) {
            var curleft = 0, curtop = 0, curHt = 0, curWd = 0;
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                    curHt += obj.offsetHeight;
                    curWd += obj.offsetWidth;
                } while ((obj = obj.offsetParent));
            }
            return {
                top: curtop,
                left: curleft,
                height: curHt,
                width: curWd
            };
            //return [curleft,curtop, curHt, curWd];

        }
    },

    _wrapItems: {
        value: function() {
            var childNodes = Array.prototype.slice.call(this.element.children, 0);

            var i=0, len = childNodes.length;
            for(i; i< len; i++) {
                this.element.appendChild(this._makeWrapper(childNodes[i]));
                if(this.resizable && i === 0) {
                    this.element.classList.add('montage-splitterDraggable');
                    // splitter after the first
                    this.element.appendChild(this._makeDragHandle());
                }
            }
        }
    },

    /** Translate Composer requirement */
    surrenderPointer: {
        value: function(pointer, composer) {
            // If the user is sliding us then we do not want anyone using
            // the pointer
            return false;
        }
    },
    
    
    // Montage Callbacks
    
    didCreate: {
        value: function() {
            this.minWidth = this.minWidth || 20; // min = 20%
            this.maxWidth = this.maxWidth || 80; // max = 80%
            this.minHeight = this.minHeight || 20;
            this.maxHeight = this.maxHeight || 80;
        }
    },


    prepareForDraw: {
        value: function() {
            this.element.classList.add('horizontal' === this.axis ? 'montage-splitterRow' : 'montage-splitterCol');
            this._wrapItems();

            if(this.resizable) {
                this.containerWidth = this.element.offsetWidth; //1200;
                this.containerHeight = this.element.offsetHeight;

                this._handlePosition = this._getElementPosition(this._dragHandle);
                console.log('handle position X,Y ', this._handlePosition.left, this._handlePosition.top);
                this._percent = this._percent || 50;

                var isHorizontal = (this.axis === 'horizontal');

                if(isHorizontal) {
                    this.handleX = this._dragHandle.offsetLeft; //this._handlePosition.left;
                } else {
                    this.handleY = this._dragHandle.offsetTop; //this._handlePosition.top;
                }
                this._composer = Montage.create(TranslateComposer);
                this._composer.element = this._dragHandle;
                this._composer.axis = this.axis || 'vertical'; //''horizontal' ;

                if(isHorizontal) {
                    this._composer.minTranslateX = ((this.minWidth/100) * this.containerWidth);
                    this._composer.maxTranslateX = (this.maxWidth/100) * this.containerWidth;
                    this._composer.translateX = this.handleX;
                    Object.defineBinding(this, "handleX", {
                        boundObject: this._composer,
                        boundObjectPropertyPath: "translateX"
                    });
                } else {
                    this._composer.minTranslateY = (this.minHeight/100) * this.containerHeight;
                    this._composer.maxTranslateY = (this.maxHeight/100) * this.containerHeight;
                    this._composer.translateY = this.handleY;
                    Object.defineBinding(this, "handleY", {
                        boundObject: this._composer,
                        boundObjectPropertyPath: "translateY"
                    });
                }
                this._composer.load();
            }
        }
    },

    /*
    prepareForActivationEvents: {
        value: function() {
            this._composer.addEventListener('translateStart', this, false);
            this._composer.addEventListener('translateEnd', this, false);
        }
    },

    handleTranslateStart: {
        value: function(e) {
        }
    },

    handleTranslateEnd: {
        value: function(e) {

        }
    },
    */

    draw: {
        value: function() {
            if(this.resizable) {
                var wrapper = this._wrappers[0];
                // if we provide inline width, set the webkit-flex to none
                wrapper.style['-webkit-flex'] = 'none';
                console.log('draw  = ', this._percent);
                var percent = this._percent + '%';
                if("horizontal" === this.axis) {
                    wrapper.style.width = percent;
                } else {
                    wrapper.style.height = this.handleY + 'px'; //percent;
                }

            }


        }
    }

});
