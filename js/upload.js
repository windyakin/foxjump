(function(){

$(function(){
	
	var userAgent = window.navigator.userAgent.toLowerCase();
	// if firefox (labelをクリックしてもfile選択ダイアログがでない場合)
	if (userAgent.indexOf("firefox") != -1 || userAgent.indexOf('gecko') != -1) {
		$(".file_select label").click(function (e) {
				$("#" + $(this).attr("for")).click();
				return false;
		});
	}
	
	$("#debug").text("ファイルを選択してください");
	
	$("#file").change(function(){
		// 値の取得
		var val  = $(this).val();
		judgeExtension(val);
	});
	
	// FormDataとFileAPIに対応していれば
	if ( window.FormData && window.File ) {
		uploadModernBrowser();
	}
	// 非対応であれば
	else {
		uploadLegacyBrowser();
	}
	
});

function judgeExtension(val)
{
	// ファイル名
	var name = val.split(/[\\|/]/g).pop();
	// 拡張子
	var ext  = name.split(".").pop().toLowerCase();
	
	$("#debug").text("ファイル名: " + name);
	
	// アップロードできる拡張子の一覧表を取得
	$.getJSON("/setting/acceptExt.json", function(json){
		var extinfo = null;
		// 対応している拡張子かチェック
		$.each(json.acceptExt, function(index, val){
			if (val.ext == ext) extinfo = val;
		});
		if ( extinfo ) {
			if ( extinfo.pwd ) {
				$("#debug").append("[パスワード必須]");
			}
			if ( extinfo.conv ) {
				$("#debug").append("[拡張子が ."+extinfo.conv+" に変換されます]");
			}
		}
		else {
			$("#debug").append("[対応してない拡張子です]");
		}
	});
}

function uploadModernBrowser()
{
	$("#submit").click(function(){
		
		$("#debug").text("アップロード中です... 0%");
		
		// FormDataの生成
		var fd = new FormData($("#upload")[0]);
		
		// ajaxでアップロード
		$.ajax($("#upload").attr("action"), {
			type: 'post',
			processData: false,
			contentType: false,
			data: fd,
			dataType: 'json',
			
			// アップロード進行状況
			xhr: function(){
				XHR = $.ajaxSettings.xhr();
				if (XHR.upload) {
					XHR.upload.addEventListener('progress', function(e){
						progre = parseInt(e.loaded/e.total*100);
						$("#debug").text("アップロード中です... "+progre+"%");
					}, false); 
				}
				return XHR;
			},
			
			// 成功した時
			success: function(data){
				$("#debug").text("アップロードが完了しました 100%");
				console.dir(data);
				$("#upload")[0].reset();
			},
			
			// 何らかのエラーのとき
			error: function(data, status, errorThrown){
				$("#debug").text("ERROR!: "+errorThrown);
			}
		});
	});
}

function uploadLegacyBrowser()
{
	// iframeをつかった擬似ajaxアップロードに対応する
	$("#upload").attr("target", "iframe_upload");
	
	$("#submit").click(function(){
		$("#upload").submit();
		$("#debug").text("アップロード中です...");
		return false;
	});
	
	$("#upload").submit(function(){
		$("#iframe_upload").unbind().bind('load', function(){
			// 戻り値をjsonとして扱う
			var data = $.parseJSON($("#iframe_upload").contents().text());
			console.dir(data);
			$("#debug").text("アップロードが完了しました");
			$("#upload")[0].reset();
		});
	});
}

})();
