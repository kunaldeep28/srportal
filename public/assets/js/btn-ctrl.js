$("#btn-edit").click(function(){
	$("#edit").css("display", "block");
	$("#btn-edit").css("display", "none");
	$("#btn-del").css("display", "none");
})

$("#btn-update").click(function(){
	$("#edit").css("display", "none");
	$("#btn-edit").css("display", "block");
	$("#btn-del").css("display", "block");
})