var dmultiplayer_darkly = {};

(function()
{
	dmultiplayer_darkly.modPath = GDT.getRelativePath();

	var ready = function()
	{
		dMultiplayer.init();
	};

	var error = function()
	{
		alert("Failed to initialize dMultiplayer");
	};
	
	var path = require("path");
	var filestoload = [dmultiplayer_darkly.modPath + "/inside/dmultiplayer.js"];
	var langfile = dmultiplayer_darkly.modPath + "/lang/" + GameManager.getPreferredLanguage() + ".js";
	
	if (path.existsSync(langfile))
		filestoload.push(langfile);
	
	GDT.loadJs(filestoload, ready, error);
})();
