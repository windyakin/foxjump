(function(){

$(function(){
	
	var userAgent = window.navigator.userAgent.toLowerCase();
	// if firefox (labelをクリックしてもfile選択ダイアログがでない場合)
	if (userAgent.indexOf("firefox") != -1 || userAgent.indexOf('gecko') != -1) {
		$("#file_select label").click(function (e) {
				$("#" + $(this).attr("for")).click();
				return false;
		});
	}
	
	$("#debug").text("ファイルを選択してください");
	
	// ファイルが選択されたら
	$("#file").change(function(){
		// 値を取得
		var val = $(this).val();
		// ファイル名
		var name = val.split(/[\\|/]/g).pop();
		// 拡張子
		var ext  = name.split(".").pop().toLowerCase();
		
		//
		$("#extra_input").slideDown();
		$("#file_select").slideUp();
		
		
		// 拡張子による必須入力項目のハイライトなど
		judgeExtension(ext);
	});
	
	// クリアボタンが押されたら
	$(".clear").click(function(){
		$("#upload")[0].reset();
		$("#extra_input").slideUp();
		$("#file_select").slideDown();
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

function judgeExtension(ext)
{
	// アップロードできる拡張子の一覧表を取得
	$.getJSON("/setting/acceptExt.json", function(json){
		var info = null;
		// 対応している拡張子かチェック
		$.each(json.acceptExt, function(index, val){
			if (val.ext == ext) info = val;
		});
		
		// 本来はreturnしたいけど非同期通信なのでココに描きます
		if ( info == null ) {
			
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
	// 警告を表示
	$("#alert_legacy").show();
	
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
