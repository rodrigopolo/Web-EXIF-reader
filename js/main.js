+ function($) {
	'use strict';

	var images;
	var current_image;
	var proc_count;

	function gps(d,r){
		var p = (d[0]+(d[1]/60)+(d[2]/3600)).toFixed(5);
		return (r == 'S' || r == 'W')?p*-1:p;
	}

	function doTheLoop(){
		if(current_image < images.length){
			procFile(images[current_image], function(){
				current_image++;
				doTheLoop();
			});
		}else{
			// Quee complete
			if(proc_count<1){
				$('#fl_cnt').hide();
			}
		}
	}

	function procFile(file, cb){
		var img;
		var reader = new FileReader();
		reader.addEventListener('load', function(e){
			if(file.type == 'image/jpeg'){
				try{
					var img = findEXIFinJPEG(e.target.result);
				}catch(e){}
				renderHTML(file.name, img, cb);
			}else if(file.type == 'image/heic'){
				try{
					var img = findEXIFinHEIC(e.target.result);
				}catch(e){}
				renderHTML(file.name, img, cb);
			}else{
				cb();
			}
		});
		reader.readAsArrayBuffer(file);
	}

	function renderHTML(f, d, cb){
		// Yes, I know I can use a template library, but meh
		var html = '<div class="media text-muted pt-3">';
				if(d.thumbnail.blob){
					html+='<img src="'+URL.createObjectURL(d.thumbnail.blob)+'" class="bd-placeholder-img mr-2 rounded">';
				}
				html+='<p class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">'
					+'<strong class="d-block text-gray-dark">'+f+'</strong>'
					+d.ExposureTime.numerator+'/'+d.ExposureTime.denominator
					+'s at f/'+d.FNumber.toFixed(1)
					+', ISO '+d.ISOSpeedRatings+', '
					+d.FocalLength.toPrecision()+'mm';
					if(d.FocalLengthIn35mmFilm){
						html+= ' ('+d.FocalLengthIn35mmFilm+'mm)';
					}
					html+= ', '+d.Model
					+', '+moment(d.DateTimeDigitized,"YYYY:MM:DD HH:mm:ss").format('h:mma D-MMM-YYYY');;
					if(d.GPSLatitude){
						html+= ', (<a href="https://www.google.com/maps/search/'+gps(d.GPSLatitude,d.GPSLatitudeRef)+','+gps(d.GPSLongitude,d.GPSLongitudeRef)+'" target="_blank">'+gps(d.GPSLatitude,d.GPSLatitudeRef)+','+gps(d.GPSLongitude,d.GPSLongitudeRef)+'</a>)';
					}
				html+='.</p></div>';
		$('#file_list').append(html);
		proc_count++;
		cb();
	}

	var dropZone = document.getElementById('drop-zone');
	var uploadForm = document.getElementById('js-upload-form');

	var startLoop = function(files) {
		images = files;
		current_image = 0;
		proc_count = 0;
		$('#file_list').empty();
		$('#fl_cnt').show();
		doTheLoop();
	}

	dropZone.ondrop = function(e) {
		e.preventDefault();
		this.className = 'upload-drop-zone';
		startLoop(e.dataTransfer.files)
	}

	dropZone.ondragover = function() {
		this.className = 'upload-drop-zone drop';
		return false;
	}

	dropZone.ondragleave = function() {
		this.className = 'upload-drop-zone';
		return false;
	}

}(jQuery);