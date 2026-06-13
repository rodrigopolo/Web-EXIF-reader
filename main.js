(function() {
	'use strict';

	var images;
	var current_image;
	var proc_count;
	var fileRefs;

	function escapeHTML(s){
		return String(s).replace(/[&<>"']/g, function(c){
			return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
		});
	}

	function roundNum(n){
		if(!isFinite(n) || Number.isInteger(n)) return n;
		return Math.round(n*1e6)/1e6;
	}

	function formatValue(v){
		if(v === null || v === undefined) return '';
		if(v instanceof Date) return isNaN(v) ? '' : v.toLocaleString();
		if(ArrayBuffer.isView(v)) return '['+v.length+' values]';
		if(Array.isArray(v)){
			if(v.length > 16) return '['+v.length+' items]';
			return v.map(formatValue).join(', ');
		}
		if(typeof v === 'object'){
			var json = JSON.stringify(v, function(key, val){
				return typeof val === 'number' ? roundNum(val) : val;
			});
			return json && json.length > 300 ? json.slice(0, 300)+'…' : json;
		}
		if(typeof v === 'number') return String(roundNum(v));
		return String(v);
	}

	function buildDetailsTable(meta){
		var keys = meta ? Object.keys(meta).sort() : [];
		if(!keys.length) return '<p class="exif-placeholder">No additional metadata found.</p>';
		var rows = '';
		for(var i=0;i<keys.length;i++){
			var key = keys[i];
			rows += '<tr><td class="exif-key">'+escapeHTML(key)+'</td><td class="exif-val">'+escapeHTML(formatValue(meta[key]))+'</td></tr>';
		}
		return '<table class="exif-table">'+rows+'</table>';
	}

	function formatExposureTime(t){
		if(t >= 1) return t+'s';
		return '1/'+Math.round(1/t)+'s';
	}

	function formatDate(date){
		if(!(date instanceof Date) || isNaN(date)) return '';
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		var hour = date.getHours();
		var ampm = hour >= 12 ? 'pm' : 'am';
		var h12 = hour % 12 || 12;
		var mins = ('0'+date.getMinutes()).slice(-2);
		return h12+':'+mins+ampm+' '+date.getDate()+'-'+months[date.getMonth()]+'-'+date.getFullYear();
	}

	function isSupportedImage(file){
		if(file.type == 'image/jpeg' || file.type == 'image/heic' || file.type == 'image/heif') return true;
		return /\.(jpe?g|heic|heif)$/i.test(file.name);
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
				flCnt.style.display = 'none';
			}
		}
	}

	function procFile(file, cb){
		if(!isSupportedImage(file)){
			cb();
			return;
		}
		Promise.all([
			exifr.parse(file).catch(function(){ return null; }),
			exifr.thumbnailUrl(file).catch(function(){ return undefined; })
		]).then(function(result){
			renderHTML(file, result[0], result[1], cb);
		});
	}

	function renderHTML(file, d, thumbUrl, cb){
		// Yes, I know I can use a template library, but meh
		var index = fileRefs.length;
		fileRefs.push(file);

		var html = '<div class="media-entry" data-index="'+index+'">';
				html += '<div class="media text-muted pt-3" role="button" tabindex="0" aria-expanded="false">';
				if(thumbUrl){
					html+='<img src="'+thumbUrl+'" class="bd-placeholder-img mr-2 rounded">';
				}
				html+='<p class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">'
					+'<strong class="d-block text-gray-dark">'+escapeHTML(file.name)+'</strong>';

				var parts = [];
				if(d){
					var exposure = '';
					if(d.ExposureTime) exposure += formatExposureTime(d.ExposureTime);
					if(d.FNumber) exposure += (exposure ? ' at ' : '')+'f/'+d.FNumber.toFixed(1);
					if(exposure) parts.push(exposure);

					if(d.ISO) parts.push('ISO '+d.ISO);

					if(d.FocalLength){
						var focal = (Math.round(d.FocalLength*10)/10)+'mm';
						if(d.FocalLengthIn35mmFormat) focal += ' ('+d.FocalLengthIn35mmFormat+'mm equiv.)';
						parts.push(focal);
					}

					if(d.Model) parts.push(escapeHTML(d.Model));

					var date = formatDate(d.CreateDate || d.DateTimeOriginal);
					if(date) parts.push(date);

					if(typeof d.latitude == 'number' && typeof d.longitude == 'number'){
						var lat = d.latitude.toFixed(5);
						var lon = d.longitude.toFixed(5);
						parts.push('(<a href="https://www.google.com/maps/search/'+lat+','+lon+'" target="_blank">'+lat+','+lon+'</a>)');
					}
				}

				html += parts.length ? parts.join(', ') : 'No EXIF data found';
				html+='.</p>';
				html += '<span class="exif-toggle" aria-hidden="true">&#9662;</span>';
				html += '</div>';
				html += '<div class="exif-details"><div class="exif-details-inner"></div></div>';
		html += '</div>';
		fileList.insertAdjacentHTML('beforeend', html);
		proc_count++;
		cb();
	}

	function onRowToggle(e){
		if(e.target.closest('a')) return;
		var media = e.target.closest('.media');
		if(!media) return;
		var entry = media.parentElement;
		var details = entry.querySelector('.exif-details');
		var inner = details.querySelector('.exif-details-inner');

		if(entry.classList.contains('open')){
			details.style.maxHeight = '0px';
			entry.classList.remove('open');
			media.setAttribute('aria-expanded', 'false');
			return;
		}

		entry.classList.add('open');
		media.setAttribute('aria-expanded', 'true');

		if(!entry.dataset.loaded){
			inner.innerHTML = '<p class="exif-placeholder">Loading…</p>';
			details.style.maxHeight = inner.offsetHeight+'px';
			exifr.parse(fileRefs[entry.dataset.index], true)
				.then(buildDetailsTable)
				.catch(function(){ return '<p class="exif-placeholder">Unable to read metadata.</p>'; })
				.then(function(tableHtml){
					inner.innerHTML = tableHtml;
					entry.dataset.loaded = '1';
					details.style.maxHeight = inner.offsetHeight+'px';
				});
		}else{
			details.style.maxHeight = inner.offsetHeight+'px';
		}
	}

	var dropZone = document.getElementById('drop-zone');
	var fileInput = document.getElementById('file-input');
	var flCnt = document.getElementById('fl_cnt');
	var fileList = document.getElementById('file_list');

	var startLoop = function(files) {
		images = files;
		current_image = 0;
		proc_count = 0;
		fileRefs = [];
		fileList.innerHTML = '';
		flCnt.style.display = 'block';
		doTheLoop();
	}

	document.addEventListener('dragover', function(e){ e.preventDefault(); });
	document.addEventListener('drop', function(e){ e.preventDefault(); });

	dropZone.ondrop = function(e) {
		e.preventDefault();
		this.className = 'upload-drop-zone';
		startLoop(e.dataTransfer.files)
	}

	dropZone.ondragover = function(e) {
		e.preventDefault();
		this.className = 'upload-drop-zone drop';
	}

	dropZone.ondragleave = function() {
		this.className = 'upload-drop-zone';
	}

	dropZone.onclick = function() {
		fileInput.click();
	}

	dropZone.onkeydown = function(e) {
		if(e.key === 'Enter' || e.key === ' '){
			e.preventDefault();
			fileInput.click();
		}
	}

	fileInput.onchange = function() {
		startLoop(this.files);
		this.value = '';
	}

	fileList.addEventListener('click', onRowToggle);
	fileList.addEventListener('keydown', function(e){
		if((e.key === 'Enter' || e.key === ' ') && e.target.closest('.media')){
			e.preventDefault();
			onRowToggle(e);
		}
	});

})();
