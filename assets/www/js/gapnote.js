(function($){
	var self = $.mobile.GapNote = {
			transition : 'none',
			checkTransition : function (){
				$.mobile.defaultPageTransition = self.transition;
			},
			init : function(){
				self.checkTransition();
				
				$(document).bind('pageinit',function(){
					console.log('pageinit');
					$('#transition').change(function(){
						self.transition = $(this).val();
						self.checkTransition();
					});
					
				});
				
				$('#nueva').live('pageshow',function(){
					var fecha = (new Date()).toUTCString();
					$('#fecha').val(fecha);
					
					$('#crear').off('click').on('click',function(){
						self.crearNota();
					});
					
					$('#sacar-foto').off('click').on('click',function(){
						self.capturarFoto();
					})					
					
				});
				
				$('#listado').live('pageshow',function(){
					self.leerNotas();
				});				
				
			},
			connection : null,
			openDatabase : function(){
				self.connection = window.openDatabase("GapNote", "1.0", "Notas de GapNote", 200000);				
			},
			leerNotas: function(){
				self.transaction(function(tx){
					tx.executeSql('SELECT * FROM Notas',[],function(tx,rs){
						if(rs.rows.length >0){
							var lista = $('<ul/>');
							for(var i=0; i<rs.rows.length;i++){
								var item = rs.rows.item(i);
								lista.append(
									$('<li/>').append(
										$('<a/>').data('item',item).bind('vclick',function(){
											self.verNota($(this).data('item'));
										}).attr('href','javascript:void(0)').append(
											$('<h2/>').text(item.titulo)
										).append(
												$('<p/>').text(item.fecha)
										)
									).append(
										$('<a/>').data('item',item).attr('data-icon','delete').attr('data-theme','e').bind('vclick',function(){
											var id = $(this).data('item').id;
											self.borrarNota(id);											
											$(this).parent().fadeOut();
										})
									)
								);								
							}
							
							$('#listado-notas').empty().append(lista.children()).listview('refresh');
						}
						
					},self.err);
				},self.err);
			},			
			borrarNota : function(id){				
				self.transaction(function(tx){
					tx.executeSql('DELETE FROM Notas WHERE id = ?',[id]);
				});
			},
			transaction : function(fn,err,suc){
				if(self.connection==null){
					self.openDatabase();
				}
				
				self.connection.transaction(fn);				
			},	
			verNota : function(item){
				
				$('#titulo-val').text(item.titulo);
				$('#fecha-val').text(item.fecha);
				$('#descripcion-val').text(item.descripcion);
				$('#foto-val').css('background-image','url('+item.foto+')');
				$.mobile.changePage('#ver');
			},
			crearNota: function(){
				var nota = [ $('#titulo').val(),
				             $('#fecha').val(),
				             $('#descripcion').val(),
				             $('#foto').data('rawImage')
				];
				
				
				self.transaction(function(tx){
					 //tx.executeSql('DROP TABLE IF EXISTS Notas');
				     tx.executeSql('CREATE TABLE IF NOT EXISTS Notas (id INTEGER PRIMARY KEY ASC, titulo VARCHAR(50), fecha VARCHAR(30), descripcion TEXT, foto TEXT)');			     
				     tx.executeSql('INSERT INTO Notas (titulo, fecha, descripcion, foto) VALUES (?,?,?,?)',nota,function(tx){
				    	 $.mobile.changePage('#listado');
				    	 document.getElementById('frmNueva').reset();
				     }, function(tx,err){
				    	 self.error(tx,err);
				     });				     
					
				})
				
			},			
			capturarFoto : function(){
				navigator.camera.getPicture(function(imageData){
					var url = "data:image/jpeg;base64," + imageData;
					$('#foto').css('background-image','url('+url+')').data('rawImage',url);
				}, function(){
					console.error('Error');
					
				}, { quality: 50,
			        destinationType: navigator.camera.DestinationType.DATA_URL });				
			},
			error : function(tx,err){
		    	 console.error('Error!!!',err);
		    	 alert('Se ha producido un error: ' + err.message)
			}
	};
	
	self.init();
	
})(jQuery);