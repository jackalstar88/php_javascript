/* 
* @author Niklas von Hertzen <niklas at hertzen.com>
* @created 10.7.2012 
* @website http://hertzen.com
 */

(function( MODULES ) {
    
    var DEFAULT = "default output handler",
    COMPILER = PHP.Compiler.prototype,
    OUTPUT_BUFFERS = COMPILER.OUTPUT_BUFFERS,
    CONSTANTS = PHP.Constants,
    flags = [],
    types = [],
    erasable = [],
    recurring = 0,
    NO_BUFFER_MSG = "(): failed to delete buffer. No buffer to delete",
    handlers = [];
    
    function pop() {
        handlers.pop();
        flags.pop();
        types.pop();
        erasable.pop();
    }
    
    MODULES.ob_gzhandler = function( str ) {
        return str; 
    };
    
    MODULES.$obreset = function() {
        flags = [];
        types = [];
        handlers = [];
        erasable = [];
        recurring = 0;
    };
    
    MODULES.$ob = function( str )  {
        var index = this[ COMPILER.OUTPUT_BUFFERS ].length - 1,
        VARIABLE = PHP.VM.Variable.prototype;
      

      

        this[ COMPILER.OUTPUT_BUFFERS ][ index ] += str;
        
        

    };
    
    MODULES.$flush = function( str, minus ) {
        minus = (minus === undefined) ? 1 : 0;
        var index = (this[ COMPILER.OUTPUT_BUFFERS ].length - 1) - minus,
        VARIABLE = PHP.VM.Variable.prototype;
        // trigger flush
        if ( handlers[ index ] !== DEFAULT &&  handlers[ index  ] !== undefined &&  this[ COMPILER.DISPLAY_HANDLER ] !== false) {
            recurring++;
            // check that we aren't ending up in any endless error loop
       
            if ( recurring <= 10 ) {
                this[ COMPILER.DISPLAY_HANDLER ] = true;

                var result = this[ handlers[ index ] ].call( this, new PHP.VM.Variable( str ), new PHP.VM.Variable( types[ index ] ) );
                         
                recurring = 0;
                this[ COMPILER.DISPLAY_HANDLER ] = undefined;
                if ( result[ VARIABLE.TYPE ] !== VARIABLE.NULL ) {
                    return result[ COMPILER.VARIABLE_VALUE ];
                } 
                
               
                
               
            }
            return "";
        } else {
            return str;
        }
    };
    
    MODULES.ob_clean = function() {

    
        if ( !this[ COMPILER.SIGNATURE ]( arguments, "ob_clean", 0, [ ] ) ) {
            return new PHP.VM.Variable( null );
        }
    
        var index = erasable.length - 1;

        if ( erasable[ index ] === false ) {
            this[ COMPILER.ERROR ]("ob_clean(): failed to delete buffer of "  + handlers[ index ] + " (0)", PHP.Constants.E_CORE_NOTICE, true );
            return new PHP.VM.Variable( false ); 
        }
    
        if ( this[ COMPILER.OUTPUT_BUFFERS ].length > 1 ) {
            this[ COMPILER.OUTPUT_BUFFERS ].pop();
            this[ COMPILER.OUTPUT_BUFFERS ].push("");
            return new PHP.VM.Variable( true );
        } else {
            this[ COMPILER.ERROR ]("ob_clean(): failed to delete buffer. No buffer to delete", PHP.Constants.E_CORE_NOTICE, true );
            return new PHP.VM.Variable( false );
        }
    };

    
    MODULES.$obflush = function() {
        var index = this[ COMPILER.OUTPUT_BUFFERS ].length - 1,
        VARIABLE = PHP.VM.Variable.prototype;
        var content = this[ COMPILER.OUTPUT_BUFFERS ][ index ];
        this[ COMPILER.OUTPUT_BUFFERS ][ index ] = "";
        var value = this.$flush.call( this, content );
       
        this[ COMPILER.OUTPUT_BUFFERS ][ index ] = value;
        
    }
    
    MODULES.ob_start = function( output_callback, chunk_size, erase ) {
        
        var handler = DEFAULT, type;
        
        if ( output_callback !== undefined ) {
            handler = output_callback[ COMPILER.VARIABLE_VALUE ];
            type = CONSTANTS.PHP_OUTPUT_HANDLER_START;          
        } else {
            type = CONSTANTS.PHP_OUTPUT_HANDLER_WRITE;
        }
        
        this[ OUTPUT_BUFFERS ].push("");
        types.push( type )
        flags.push( CONSTANTS.PHP_OUTPUT_HANDLER_STDFLAGS | type );
        handlers.push( handler );
        
        if ( erase === undefined || erase[ COMPILER.VARIABLE_VALUE ] === true ) {
            erasable.push( true );
        } else {
            erasable.push( false );
        }
        
        return new PHP.VM.Variable( true );
    };
    
    MODULES.ob_end_clean = function() {

        var FUNCTION_NAME = "ob_end_clean";
        
        if ( !this[ PHP.Compiler.prototype.SIGNATURE ]( arguments, FUNCTION_NAME, 0, [ ] ) ) {
            return new PHP.VM.Variable( null );
        }
        
        var index = erasable.length - 1;
        if ( erasable[ index ] === false ) {
            this[ COMPILER.ERROR ]( FUNCTION_NAME + "(): failed to discard buffer of "  + handlers[ index ] + " (0)", PHP.Constants.E_CORE_NOTICE, true );
            return new PHP.VM.Variable( false ); 
        }
    
        if ( this[ COMPILER.OUTPUT_BUFFERS ].length > 1 ) {
            this[ OUTPUT_BUFFERS ].pop();
            pop();
            return new PHP.VM.Variable( true );
        } else {
            this[ COMPILER.ERROR ]( FUNCTION_NAME + NO_BUFFER_MSG, PHP.Constants.E_CORE_NOTICE, true );
            return new PHP.VM.Variable( false );
        }
        
       
        
    };


    MODULES.ob_end_flush = function() {
             
        var FUNCTION_NAME = "ob_end_flush";
        
        if ( !this[ PHP.Compiler.prototype.SIGNATURE ]( arguments, FUNCTION_NAME, 0, [ ] ) ) {
            return new PHP.VM.Variable( null );
        }
        
        var index = erasable.length - 1;
        if ( erasable[ index ] === false ) {
            this[ COMPILER.ERROR ]( FUNCTION_NAME + "(): failed to send buffer of "  + handlers[ index ] + " (0)", PHP.Constants.E_CORE_NOTICE, true );
            return new PHP.VM.Variable( false ); 
        }
    
        if ( this[ COMPILER.OUTPUT_BUFFERS ].length > 1 ) {
            var flush = this[ OUTPUT_BUFFERS ].pop();
            this[ OUTPUT_BUFFERS ][ this[ OUTPUT_BUFFERS ].length - 1 ] += this.$flush( flush, 1 );
            pop();

            return new PHP.VM.Variable( true );
        } else {
            this[ COMPILER.ERROR ]( FUNCTION_NAME + "(): failed to delete and flush buffer. No buffer to delete or flush", PHP.Constants.E_CORE_NOTICE, true );
            return new PHP.VM.Variable( false );
        }

    };

    MODULES.ob_get_flush = function() {
        var FUNCTION_NAME = "ob_get_flush";
        
        if (this[ COMPILER.DISPLAY_HANDLER ] === true) {
            this[ COMPILER.ERROR ]( "ob_get_flush(): Cannot use output buffering in output buffering display handlers", PHP.Constants.E_ERROR, true );  
        }
        
        //  var flush = this[ OUTPUT_BUFFERS ].pop();
        var index = erasable.length - 1;
        var flush =  this[ OUTPUT_BUFFERS ][ this[ OUTPUT_BUFFERS ].length - 1];
            
        if ( erasable[ index ] === false ) {
            this[ COMPILER.ERROR ]( FUNCTION_NAME + "(): failed to send buffer of "  + handlers[ index ] + " (0)", PHP.Constants.E_CORE_NOTICE, true );
                
            this[ COMPILER.ERROR ]( FUNCTION_NAME + "(): failed to delete buffer of "  + handlers[ index ] + " (0)", PHP.Constants.E_CORE_NOTICE, true );
        } else {
            this[ OUTPUT_BUFFERS ].pop();
            this[ OUTPUT_BUFFERS ][ this[ OUTPUT_BUFFERS ].length - 1 ] += this.$flush( flush, 1 );
            
            pop();
        }
        
        

        return new PHP.VM.Variable( flush );
    };


    MODULES.ob_get_clean = function() {
        
        var FUNCTION_NAME = "ob_get_clean";
        
        if ( !this[ PHP.Compiler.prototype.SIGNATURE ]( arguments, FUNCTION_NAME, 0, [ ] ) ) {
            return new PHP.VM.Variable( null );
        }
        
                
        var index = erasable.length - 1;

       
        if ( this[ OUTPUT_BUFFERS ].length > 1 ) {
            
            var flush =  this[ OUTPUT_BUFFERS ][ this[ OUTPUT_BUFFERS ].length - 1];
            
            if ( erasable[ index ] === false ) {
                this[ COMPILER.ERROR ]( FUNCTION_NAME + "(): failed to discard buffer of "  + handlers[ index ] + " (0)", PHP.Constants.E_CORE_NOTICE, true );
                
                this[ COMPILER.ERROR ]( FUNCTION_NAME + "(): failed to delete buffer of "  + handlers[ index ] + " (0)", PHP.Constants.E_CORE_NOTICE, true );
            } else {
                this[ OUTPUT_BUFFERS ].pop();
                pop();
            }
            return new PHP.VM.Variable( flush );
        } else {
            return new PHP.VM.Variable( false );
        }
        
    };

    MODULES.ob_list_handlers = function() {
        return PHP.VM.Array.fromObject.call( this, handlers );
    };
    
    MODULES.ob_get_status = function( full_status ) {

        var item = PHP.VM.Array.arrayItem,
       
        get_status = function( index ) { 
            return [ 
            item("name", handlers[ index ]), 
            item("type", types[ index ]), 
            item("flags", flags[ index ]),
            item("level", index), 
            item("chunk_size", 0),
            item("buffer_size", 16384),
            item("buffer_used", this[ OUTPUT_BUFFERS ][ index + 1 ].length )
               
            ];
          
        }.bind(this);
       
       
                  
        if (this[ OUTPUT_BUFFERS ].length === 1 ) {
            return this.array([]);
        }
        
        if ( full_status !== undefined && full_status[COMPILER.VARIABLE_VALUE] === true ) {
            var arr = [];
            handlers.forEach(function( handler, index ){
                arr.push( item( index, this.array( get_status( index) ) ) )
            }, this);
            return this.array( arr );
        } else{
            return this.array( get_status( handlers.length - 1 ) );
        }
        
        
       
    };
    
    MODULES.ob_implicit_flush = function() {
        var FUNCTION_NAME = "ob_implicit_flush";
        
        if ( !this[ PHP.Compiler.prototype.SIGNATURE ]( arguments, FUNCTION_NAME, -1, [ ] ) ) {
            return new PHP.VM.Variable( null );
        }
        return new PHP.VM.Variable();
    };
    
})( PHP.Modules.prototype );
