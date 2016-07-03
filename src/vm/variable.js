/* 
 * @author Niklas von Hertzen <niklas at hertzen.com>
 * @created 24.6.2012 
 * @website http://hertzen.com
 */

PHP.VM.VariableHandler = function( ENV ) {
    
    var variables = {},
    methods = function( variableName, setTo ) {
        
        if (setTo instanceof PHP.VM.Variable) {
            variables[ variableName ] = setTo;
            return methods;
        }
        
        if ( variables[ variableName ] === undefined ) { 
            
          
            variables[ variableName ] = new PHP.VM.Variable();
            variables[ variableName ][ PHP.VM.Variable.prototype.DEFINED ] = variableName;
            variables[ variableName ].ENV = ENV;
           
        /*
            Object.defineProperty( variables, variableName, {
                value: new PHP.VM.Variable()
            });
            
           
           
           
            Object.defineProperty( variables, variableName, {
                value: Object.defineProperty( {}, PHP.Compiler.prototype.VARIABLE_VALUE, {
                        set: function( val ) {
                            // we are setting a val to a newly created variable
                           variables[ variableName ] = new PHP.VM.Variable( val );
                        },
                        get: function() {
                            // attempting to retrieve a value of undefined property
                            console.log( variables );
                            console.log( variableName + " not defined");
                        }
                    }
                
                )
            });
             */
            
        }

        
        
        return variables[ variableName ];
    };
    
    return methods;
    
};

PHP.VM.VariableProto = function() {

    }

PHP.VM.VariableProto.prototype[ PHP.Compiler.prototype.CONCAT ] = function( combinedVariable ) {
    
    var COMPILER = PHP.Compiler.prototype,
    VARIABLE = PHP.VM.Variable.prototype;

    return new PHP.VM.Variable( this[ VARIABLE.CAST_STRING ][ COMPILER.VARIABLE_VALUE ] + "" + combinedVariable[ VARIABLE.CAST_STRING ][ COMPILER.VARIABLE_VALUE ] );
};


PHP.VM.VariableProto.prototype[ PHP.Compiler.prototype.ADD ] = function( combinedVariable ) {
    
    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable( (this[ COMPILER.VARIABLE_VALUE ] - 0) + ( combinedVariable[ COMPILER.VARIABLE_VALUE ] - 0 ) );
};

PHP.VM.VariableProto.prototype[ PHP.Compiler.prototype.MUL ] = function( combinedVariable ) {
    
    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable( (this[ COMPILER.VARIABLE_VALUE ] - 0) * ( combinedVariable[ COMPILER.VARIABLE_VALUE ] - 0 ) );
};

PHP.VM.VariableProto.prototype[ PHP.Compiler.prototype.DIV ] = function( combinedVariable ) {
    
    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable( (this[ COMPILER.VARIABLE_VALUE ] - 0) / ( combinedVariable[ COMPILER.VARIABLE_VALUE ] - 0 ) );
};


PHP.VM.VariableProto.prototype[ PHP.Compiler.prototype.MINUS ] = function( combinedVariable ) {
    
    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable( (this[ COMPILER.VARIABLE_VALUE ] - 0) - ( combinedVariable[ COMPILER.VARIABLE_VALUE ] - 0 ) );
};

PHP.VM.VariableProto.prototype[ PHP.Compiler.prototype.METHOD_CALL ] = function() {
    
    var COMPILER = PHP.Compiler.prototype;
    
    return this[ COMPILER.VARIABLE_VALUE ][ PHP.Compiler.prototype.METHOD_CALL ].apply( this[ COMPILER.VARIABLE_VALUE ], arguments );
};

PHP.VM.VariableProto.prototype[ PHP.Compiler.prototype.EQUAL ] = function( compareTo ) {
    
    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable( (this[ COMPILER.VARIABLE_VALUE ]) == ( compareTo[ COMPILER.VARIABLE_VALUE ]) );
};
 
PHP.VM.VariableProto.prototype[ PHP.Compiler.prototype.SMALLER_OR_EQUAL ] = function( compareTo ) {
    
    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable( (this[ COMPILER.VARIABLE_VALUE ]) <= ( compareTo[ COMPILER.VARIABLE_VALUE ]) );
}; 

PHP.VM.VariableProto.prototype[ PHP.Compiler.prototype.SMALLER ] = function( compareTo ) {
    
    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable( (this[ COMPILER.VARIABLE_VALUE ]) < ( compareTo[ COMPILER.VARIABLE_VALUE ]) );
}; 

PHP.VM.VariableProto.prototype[ PHP.Compiler.prototype.GREATER ] = function( compareTo ) {
    
    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable( (this[ COMPILER.VARIABLE_VALUE ]) > ( compareTo[ COMPILER.VARIABLE_VALUE ]) );
}; 
 
PHP.VM.VariableProto.prototype[ PHP.Compiler.prototype.BOOLEAN_OR ] = function( compareTo ) { 
    var COMPILER = PHP.Compiler.prototype;
    return new PHP.VM.Variable( (this[ this.CAST_STRING ][ COMPILER.VARIABLE_VALUE ]) | ( compareTo[ this.CAST_STRING ][ COMPILER.VARIABLE_VALUE ]) ); 
};

PHP.VM.Variable = function( arg ) {

    var value,
    POST_MOD = 0,
    __toString = "__toString",
    COMPILER = PHP.Compiler.prototype,
    setValue = function( newValue ) {
        this[ this.DEFINED ] = true;
        
        if ( newValue === undefined ) {
            newValue = null;
        }
        
        if ( newValue instanceof PHP.VM.Variable ) {
            newValue = newValue[ COMPILER.VARIABLE_VALUE ];
        }
        
        if ( typeof newValue === "string" ) {
            this[ this.TYPE ] = this.STRING;
        } else if ( typeof newValue === "number" ) {
            this[ this.TYPE ] = this.INT;
            
        } else if ( newValue === null ) {   
            this[ this.TYPE ] = this.NULL;

        } else if ( typeof newValue === "boolean" ) {
            this[ this.TYPE ] = this.BOOL;
        } else if ( newValue instanceof PHP.VM.ClassPrototype ) {
            if ( newValue[ COMPILER.CLASS_NAME ] === PHP.VM.Array.prototype.CLASS_NAME ) {
                this[ this.TYPE ] = this.ARRAY;
            } else {

                this[ this.TYPE ] = this.OBJECT;
            }
        } else if ( newValue instanceof PHP.VM.Resource ) {    
            this[ this.TYPE ] = this.RESOURCE;
        } else {
         
        }
        value = newValue;
        
        // remove this later, debugging only
        this.val = newValue;
    };
    
    
    setValue.call( this, arg );
    
    this[ PHP.Compiler.prototype.NEG ] = function() {
        value = -value;
        return this;
    };
    
    Object.defineProperty( this, COMPILER.POST_INC,
    {
        get : function(){
            POST_MOD++;
            var tmp = this[ COMPILER.VARIABLE_VALUE ]; // trigger get, incase there is POST_MOD
            this.POST_MOD = POST_MOD;
            return this;
        }
    });
    
    Object.defineProperty( this, COMPILER.POST_DEC,
    {
        get : function(){
            POST_MOD--;
            var tmp = this[ COMPILER.VARIABLE_VALUE ]; // trigger get, incase there is POST_MOD
            this.POST_MOD = POST_MOD;
            return this;
        }
    });
    

   
    this[ PHP.Compiler.prototype.UNSET ] = function() {
        setValue( null );
        this.DEFINED = false;
    };
    
    Object.defineProperty( this, COMPILER.VARIABLE_VALUE,
    {
        get : function(){
            
            if ( this[ this.DEFINED ] !== true && this[ COMPILER.SUPPRESS ] !== true ) {
                this.ENV[ COMPILER.ERROR ](" Undefined variable: " + this.DEFINED + " in ", PHP.Constants.E_CORE_NOTICE );    
                
            }
            
            var returning = value;
            
            // perform POST_MOD change
           
            if ( POST_MOD !== 0 ) {
                value = POST_MOD + (value - 0);
                POST_MOD = 0; // reset counter
            }
            
            
            return returning;
        },  
        set : setValue
    }
    );
    
    Object.defineProperty( this, this.CAST_BOOL,
    {
        get : function(){
            // http://www.php.net/manual/en/language.types.boolean.php#language.types.boolean.casting
            
            var value = this[ COMPILER.VARIABLE_VALUE ]; // trigger get, incase there is POST_MOD
            
            if ( this[ this.TYPE ] === this.INT ) {
                if ( value === 0 ) {
                    return new PHP.VM.Variable( false );
                } else {
                    return new PHP.VM.Variable( true );
                }
            } else if ( this[ this.TYPE ] === this.STRING ) {
                if ( value.length === 0 || value === "0") {
                    return new PHP.VM.Variable( false );
                } else {
                    return new PHP.VM.Variable( true );
                }
            } else if ( this[ this.TYPE ] === this.NULL ) {
                return new PHP.VM.Variable( false );
            }
            
            return this;
        }
    }
    );
        
    Object.defineProperty( this, this.CAST_STRING,
    {
        get : function() {
            //   http://www.php.net/manual/en/language.types.string.php#language.types.string.casting
            
            var value = this[ COMPILER.VARIABLE_VALUE ]; // trigger get, incase there is POST_MOD
            
            if ( value instanceof PHP.VM.ClassPrototype && value[ COMPILER.CLASS_NAME ] !== PHP.VM.Array.prototype.CLASS_NAME  ) {
                // class
                // check for __toString();
                
                if ( typeof value[PHP.VM.Class.METHOD + __toString ] === "function" ) {
                    return new PHP.VM.Variable( value[PHP.VM.Class.METHOD + __toString ]() );
                }
                     
            } else if (this[ this.TYPE ] === this.BOOL) {
                return new PHP.VM.Variable( ( value ) ? "1" : "0" );
            } else if (this[ this.TYPE ] === this.INT) {
                return new PHP.VM.Variable(  value + "" );
            } else if (this[ this.TYPE ] === this.NULL) {
                return new PHP.VM.Variable( "" );
            }
            return this;
        }
    }
    );

    Object.defineProperty( this, COMPILER.DIM_FETCH,
    {
        get : function(){
         
            return function( ctx, variable ) {
                if ( this[ this.TYPE ] === this.ARRAY ) {
                    //  console.log(value[ COMPILER.METHOD_CALL ]( ctx, COMPILER.ARRAY_GET, variable ));
                    return  value[ COMPILER.METHOD_CALL ]( ctx, COMPILER.ARRAY_GET, variable );
                } else {
                    //  console.log(new PHP.VM.Variable( null ));
                    return new PHP.VM.Variable( null );
                }
            };
        },  
        set : setValue
    }
    );
    
    
    return this;
    
};

PHP.VM.Variable.prototype = new PHP.VM.VariableProto();

PHP.VM.Variable.prototype.DEFINED = "$Defined";

PHP.VM.Variable.prototype.CAST_BOOL = "$Bool";

PHP.VM.Variable.prototype.CAST_STRING = "$String";

PHP.VM.Variable.prototype.NULL = 0;
PHP.VM.Variable.prototype.BOOL = 1;
PHP.VM.Variable.prototype.INT = 2;
PHP.VM.Variable.prototype.FLOAT = 3;
PHP.VM.Variable.prototype.STRING = 4;
PHP.VM.Variable.prototype.ARRAY = 5;
PHP.VM.Variable.prototype.OBJECT = 6;
PHP.VM.Variable.prototype.RESOURCE = 7;
PHP.VM.Variable.prototype.TYPE = "type";

