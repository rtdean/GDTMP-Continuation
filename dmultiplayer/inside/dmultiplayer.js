//Warning: reading this code as an experienced developer may cause you to bang your head against a wall
//Yes, it's that bad, and I'm that bad of a developer
//It's like a book with bad grammar... wait, what?
//Anyway, I am not responsible for you being sent to the hospital because of my mod.

var dMultiplayer =
{
	get allowCustomData()
	{
		return true;
	}
};

(function()
{
	var dmod;
	var sep = "\xFA";
	var sep2 = "\xFB";
	var sep3 = "\xFC";
	var sep4 = "\xFD";
	var minsrvversion = "1.5.2.0";
	var modid = "dmultiplayer";

	var settings;
	var socket;
	var isConnected = false;
	var triedConnect = false;
	var oriOnKeyUp;
	var oriRelGame;
	var oriCloseGameDef;
	var oriBuyPlat;
	var oriFinishResearch;
	var oriShowMenu;
	var oriPickCheat;
	var oriAnnConsole;
	var oriFinishConsole;
	var oriCompLoad;
	var oriPlatLoad;
	var oriPlatImage;
	var oriRevWind;
	var oriWeekPro;
	var oriCreateEngine;
	var oriFinishEngine;
	var oriSaveGame;
	var oriReload;
	var oriPlatEnd;
	var oriSellGame;
	var oriFireNotification;
	var oriLocalizationCredits;
	var oriResearchMenu;
	var oriModalClose;
	var oriAchieve;
	var oriShowGameDef;
	var oriToggleHighScore;
	var oriUpdateCost;
	var oriGetFeatureCosts;
	var oriShowReleaseDialog;
	var oriShowEngineMenu;
	var oriShowContractMenu;
	var oriCalculatePrice;
	var oriGetMMOIncome;
	var playerID;
	var serverID = "133333337";
	var kicked = false;
	var kickmessage = "none";
	var lastAnnouncedGame = "";
	var pushNew;
	var competitors = [];
	var modlist = [];
	var statusLog = "";
	var messageLog = "";
	var researchOpen = false;
	var multiplayerDialogOpen = false;
	var chatOpen = false;
	var infoOpen = false;
	var gameDefinitionOpen = false;
	var engineOpen = false;
	var contractOpen = false;
	var sentJoin = false;
	var tradeResearch;
	var coGameResearch;
	var spyResearch;
	var advancedSpyResearch;
	var sabotageResearch;
	var tradeEvent;
	var coGameEvent;
	var advancedSpyPoliceEvent;
	var sabotagePoliceEvent;
	var murderPoliceEvent;
	var assassinEvent;
	var employeeToKill;
	var isTargetSelected = false;
	var canSelectTarget = true;
	var selectedTarget = false;
	var canCloseDialog = true;
	var budgetFactor;
	var sliderMoneyToPay;
	var moneyToPay;
	var RPToPay;
	var originalPlatforms = [];
	var tmax;
	var tmax2;
	var tradeID = -1;
	var tradeCompany;
	var tradeType;
	var tradeRP;
	var tradeMoney;
	var sentBL = false;
	var sentRQ = false;
	var loopingSC = false;
	var activeMessages = 0;
	var activeReviews = 0;
	var activeAdditionalMessage = false;
	var modsAtLoad = [];
	var lastPMPlayerIndex;
	var listMinimized = false;
	var cancelOnClose = false;
	var customReceivers = {};
	var customPreReceivers = [];
	var customPostReceivers = [];
	var customSabotage = {};
	var oldServerArea;
	var currentServer;
	var readyToCloseGameDef = false;
	var coSentID = -1;
	var coID = -1;
	var coCost;
	var coRevenue;
	var coGameID;
	var coName;
	var coSize;
	var coMMO;
	var coTopic;
	var coGenre;
	var coGenre2;
	var coPlatforms;
	var coAudience;
	var coEngine;
	var coFeatures;
	var clearCoID = true;
	var chatOnlyMsgs = false;
	var pollsockets = [];
	var opped = false;
	var serverSideLoaded = false;
	var serverSideLoading = false;
	
	dMultiplayer.init = function()
	{
		$.extend(true, modsAtLoad, ModSupport.availableMods);
		dmod = modsAtLoad[dMultiplayer.getObjectArrayIndex(modsAtLoad, "id", modid)];
		
		var savebackupmodindex = dMultiplayer.getObjectArrayIndex(modsAtLoad, "id", "savebackup");
		if (savebackupmodindex > -1 && modsAtLoad[savebackupmodindex].active && dMultiplayer.compareVersions("1.0.2", modsAtLoad[savebackupmodindex].version, false))
		{
			alert("You are using an incompatible version of SaveBackup. Please update or disable it to use GDTMP.");
			return;
		}
		
		var dlocalizeVersion = 4;
		if (typeof String.prototype.dlocalize === "undefined" || (String.prototype.dlocalizeVersion && String.prototype.dlocalizeVersion < dlocalizeVersion))
		{
			String.prototype.dlocalizeVersion = dlocalizeVersion;
			String.prototype.dlocalize = function(mod, comment)
			{
				if (GameManager.getPreferredLanguage() === "en") return this.toString();
				else if (typeof dLocalization === "undefined") return this.localize();
				
				var retval;
				if (mod && typeof dLocalization[mod] !== "undefined" && typeof dLocalization[mod].currentLanguage !== "undefined")
					retval = dLocalization[mod].currentLanguage[this];
				else
					for (var localization in dLocalization)
						if (dLocalization[localization].currentLanguage[this]) return dLocalization[localization].currentLanguage[this];
				
				return (!retval) ? this.localize(comment) : retval;
			};
		}
		
		var ddelocalizeVersion = 1;
		if (typeof String.prototype.ddelocalize === "undefined" || (String.prototype.ddelocalizeVersion && String.prototype.ddelocalizeVersion < ddelocalizeVersion))
		{
			String.prototype.ddelocalizeVersion = ddelocalizeVersion;
			String.prototype.ddelocalize = function()
			{
				for (var language in Languages)
					if (Languages[language].values)
						for (var i = 0; i < Languages[language].values.length; i++)
							if (Languages[language].values[i].translation == this)
								return Languages[language].values[i].value;
				
				return this.toString();
			};
		}
		
		dMultiplayer.checkForUpdates(true);
		
		$.extend(true, originalPlatforms, Platforms.allPlatforms);
		
		if ($(".languageSelection").find("option[value=fr]").length < 1)
			$(".languageSelection").append('<option value="fr">Français (GDTMP only)</option>');
		if ($(".languageSelection").find("option[value=de]").length < 1)
			$(".languageSelection").append('<option value="de">Deutsch (GDTMP only)</option>');
		if ($(".languageSelection").find("option[value=es]").length < 1)
			$(".languageSelection").append('<option value="es">Español (GDTMP only)</option>');
		if ($(".languageSelection").find("option[value=ptbr]").length < 1)
			$(".languageSelection").append('<option value="ptbr">Português brasileiro (GDTMP only)</option>');
		if ($(".languageSelection").find("option[value=ru]").length < 1)
			$(".languageSelection").append('<option value="ru">русский (GDTMP only)</option>');
		if ($(".languageSelection").find("option[value=srel]").length < 1)
			$(".languageSelection").append('<option value="srel">Srpski (GDTMP only)</option>');
		if ($(".languageSelection").find("option[value=sv]").length < 1)
			$(".languageSelection").append('<option value="sv">Svenska (GDTMP only)</option>');
		if ($(".languageSelection").find("option[value=tr]").length < 1)
			$(".languageSelection").append('<option value="tr">Türkçe (GDTMP only)</option>');
		if ($(".languageSelection").find("option[value=zhcn]").length < 1)
			$(".languageSelection").append('<option value="zhcn">中文 (GDTMP only)</option>');

		$(".languageSelection option").sort(function(optiona, optionb)
		{
			if (optiona.innerHTML == "English")
				return -1;
			else if (optionb.innerHTML == "English")
				return 1;
			else
				return optiona.value.toLowerCase() > optionb.value.toLowerCase() ? 1 : -1;
		}).appendTo(".languageSelection");
		
		$('<div id="switchButton" class="selectorButton disabledButton windowLargeOkButton mainMenuButton">' + 'Switch Server'.dlocalize(modid) + '</div>').insertBefore('.exitButton');
		
		$('#gameUIContainer').append('<div id="gdtmpcard" style="width: 460px; height: 100px; position: absolute; font: 13.5px \'Segoe UI\', \'Open Sans\'; border: 1px solid #181818; background-color: rgba(255, 255, 255, 0.498); left: 40px; bottom: 40px; cursor: default; padding-left: 4px; padding-right: 4px; display: none; overflow: hidden;"></div>');
		$('#gameUIContainer').append('<div id="gdtmpminimize" onmousedown="dMultiplayer.toggleListMinimized()" style="width: 16px; height: 12px; position: absolute; font: 12px \'Arial\', \'Open Sans\'; border: 1px solid #181818; background-color: rgba(255, 255, 255, 0.498); left: 460px; bottom: 141px; text-align: center; display: none; cursor: pointer; padding-bottom: 4px; border-radius: 4px 0px 0px 0px;">_</div>');
		$('#gameUIContainer').append('<div id="gdtmpinfo" onmousedown="dMultiplayer.showInfoWindow()" style="width: 16px; height: 12px; position: absolute; font: 12px \'Arial\', \'Open Sans\'; border: 1px solid #181818; background-color: rgba(255, 255, 255, 0.498); left: 476px; bottom: 141px; text-align: center; display: none; cursor: pointer; padding-bottom: 4px;">i</div>');
		$('#gameUIContainer').append('<div id="gdtmpchat" onmousedown="dMultiplayer.showChatWindow()" style="width: 16px; height: 12px; position: absolute; font: 12px \'Arial\', \'Open Sans\'; border: 1px solid #181818; background-color: rgba(255, 255, 255, 0.498); left: 492px; bottom: 141px; text-align: center; display: none; cursor: pointer; padding-bottom: 4px; border-radius: 0px 4px 0px 0px;"><img src="./mods/dmultiplayer/img/chat.png" style="position: relative; top: 1px;" /></div>');
		
		$('#gameDefinition').find('.dialogScreenContainer').append('<div id="coGameDialogScreen3" style="margin-left: 200%; width: 100%; height: 100%; position: absolute; top: 0px;"><div id="coGameBackButton" class="fontCharacterButton icon-arrow-left" style="font-size: 32pt; position: absolute; left: 10px; top: 10px; z-index: 100;"></div><div class="windowTitle">' + 'Co-Develop Game'.dlocalize(modid) + '</div><div class="centeredButtonWrapper" style="margin-top: 20px"><h2><br />' + 'Split costs'.dlocalize(modid) + '</h2><span id="coGameCostComp1" style="float: left; padding-left: 12px;"></span><span id="coGameCostComp2" style="float: right; padding-right: 12px;"></span>' +
							'<div id="coGameCostSlider"></div><h2>' + 'Split revenue'.dlocalize(modid) + '</h2><span id="coGameRevenueComp1" style="float: left; padding-left: 12px;"></span><span id="coGameRevenueComp2" style="float: right; padding-right: 12px;"></span><div id="coGameRevenueSlider"></div></div><div class="centeredButtonWrapper" style="margin-top: 20px"><h2>' + 'Select company'.dlocalize(modid) + '</h2><div id="coGameTargets" style="height: 156px; overflow-y: auto; margin: 5px 20px 0px 20px;"></div></div><br />' +
							'<div class="centeredButtonWrapper okButtonWrapper"><div id="coGameButton" class="okButton selectorButton windowMainActionButton orangeButton windowLargeOkButton">' + 'Start Development'.localize() + '</div></div></div>');
		
		$('#resources').append('<div id="serverBrowserDialog" class="tallWindow windowBorder"><div class="windowTitle">' + 'Server Browser'.dlocalize(modid) + '</div><br /><div class="centeredButtonWrapper"><div id="browserListArea" style="height: 394px; overflow-y: auto;">' +
							'<table id="browserList" border="1" style="margin-left: auto; margin-right: auto; border: 2px solid #EAB656; background: #F9CE84; width: 540px; table-layout: fixed; font-size: 9pt; border-collapse: collapse;"></table></div></div>' +
							'<br /><hr /><div style="padding: 4px;"><div style="position: relative; top: 10px; left: 6px; float: left;">' + 'Recent servers:'.dlocalize(modid) + ' <select id="browserServerHistory" onchange="dMultiplayer.connectFromHistory()" onkeydown="dMultiplayer.disableKeyboard(event)"><option value="none">' + 'Select...'.dlocalize(modid) + '</option></select></div><div style="position: relative; top: 46px; left: 6px; float: left;"><input type="text" id="DCInput" style="font-size: 16pt; width: 368px;" /></div>' +
							'<div style="position: relative; left: -594px; top: -38px; float: right; width: 0px;"><div id="browserOfflineButton" class="dialogNextButton baseButton orangeButton">' + 'Play Offline'.dlocalize(modid) + '</div><div id="DCButton" class="dialogNextButton baseButton orangeButton">' + 'Direct Connect'.dlocalize(modid) + '</div></div></div></div>');
		
		$('#resources').append('<div id="chatDialog" class="tallWindow windowBorder"><div class="windowTitle">' + 'Chat'.dlocalize(modid) + '</div><div style="margin-top: 20px;"><div class="centeredButtonWrapper"><input type="text" id="chatInput" maxlength="120" style="font-size: 18pt; width: 460px;" />' +
							'</div></div><div class="centeredButtonWrapper"><div id="chatButton" class="okButton baseButton disabledButton windowMainActionButton windowLargeOkButton">' + 'Send Message'.dlocalize(modid) + '</div></div><br /><br /><div style="position: absolute; left: 50%; bottom: 32px;">' +
							'<div style="position: relative; left: -50%"><textarea id="chatArea" style="font-size: 8pt; width: 520px; height: 340px;" readonly></textarea><div style="text-align: right;"><input type="checkbox" id="chatOnlyMsgs" name="chatOnlyMsgs" style="width: auto;" /> <label for="chatOnlyMsgs">' + 'Show only chat messages'.dlocalize(modid) + '</label></div></div></div></div>');
		
		$('#resources').append('<div id="tradeDialog" class="tallWindow windowBorder"><div class="dialogScreenContainer tallWindow"><div class="windowTitle">' + 'Trading'.dlocalize(modid) + '</div><div class="dialogBackButton fontCharacterButton icon-arrow-left" style="display: none;"></div><div id="tradeCost" class="windowCostLabel" style="font-size: 14pt; width: 200px; text-align: right;">' + 'Research Points:'.dlocalize(modid) + ' 0<br />' + 'Cash:'.dlocalize(modid) + ' 0</div><br />' +
							'<div class="dialogScreen1"><br /><div class="centeredButtonWrapper" style="margin-top: 20px"><h2>' + 'Select company'.dlocalize(modid) + '</h2><div id="tradeTargets" style="height: 360px; overflow-y: auto; margin: 5px 20px 0px 20px;"></div></div><br /><div id="tradeNextButton" class="dialogNextButton baseButton disabledButton">' + 'Next'.dlocalize(modid) + '</div></div>' +
							'<div class="dialogScreen2"><br /><br /><br /><br /><br /><div class="centeredButtonWrapper" style="margin-top: 20px"><h2 id="tradeRPText">' + 'Research Points (request)'.dlocalize(modid) + '</h2><div id="tradeRPSlider"></div></div><div class="centeredButtonWrapper" style="margin-top: 20px"><h2 id="tradeCashText">' + 'Cash (offer)'.dlocalize(modid) + '</h2><div id="tradeCashSlider"></div></div>' +
							'<div class="centeredButtonWrapper" style="margin-top: 20px"><h2>' + 'Type'.dlocalize(modid) + '</h2><div id="tradeType" style="height: 156px; overflow-y: auto; margin: 5px 20px 0px 20px;"></div></div><div class="centeredButtonWrapper okButtonWrapper"><div id="tradeButton" class="okButton baseButton windowMainActionButton orangeButton windowLargeOkButton">' + 'Make offer'.dlocalize(modid) + '</div></div></div></div></div>');
		
		$('#resources').append('<div id="infoDialog" class="tallWindow windowBorder"><div class="dialogScreenContainer tallWindow">' +
							'<div class="dialogScreen1"><div class="windowTitle">' + 'Player Information'.dlocalize(modid) + '</div><div class="centeredButtonWrapper" style="margin-top: 20px"><h2>' + 'Select company'.dlocalize(modid) + '</h2><div id="infoTargets" style="height: 400px; overflow-y: auto; margin: 5px 20px 0px 20px;"></div></div><br /><div id="infoNextButton" class="dialogNextButton baseButton disabledButton">' + 'Next'.dlocalize(modid) + '</div></div>' +
							'<div class="dialogScreen2"><div class="dialogBackButton fontCharacterButton icon-arrow-left"></div><div class="windowTitle" id="infoTitle2"></div><div id="infoInsideDialogScreen1"><div id="infoArea" style="width: 400px; margin: 0 auto; display: block;"></div><br /><br /><br /><div id="infoNextButton2" class="dialogNextButton selectorButton orangeButton">' + 'Mods'.dlocalize(modid) + '</div></div></div>' +
							'<div id="infoInsideDialogScreen2" style="margin-left: 100%; width: 100%; height: 100%; position: absolute; top: 67px;"><div id="infoArea2" style="width: 400px; margin: 0 auto; display: block;"></div></div></div></div>');
		
		$('#resources').append('<div id="advSpyDialog" class="tallWindow windowBorder"><div class="windowTitle">' + 'Advanced Spying'.dlocalize(modid) + '</div><div id="advSpyCost" class="windowCostLabel">' + 'Cost:'.dlocalize(modid) + ' 500K</div><div class="centeredButtonWrapper" style="margin-top: 20px"><h2>' + 'Budget'.dlocalize(modid) + '</h2><div id="advSpyBudgetSlider"></div></div>' +
							'<div class="centeredButtonWrapper" style="margin-top: 20px"><h2>' + 'Select target'.dlocalize(modid) + '</h2><div id="advSpyTargets" style="height: 280px; overflow-y: auto; margin: 5px 20px 0px 20px;"></div></div><br />' +
							'<div class="centeredButtonWrapper okButtonWrapper"><div id="advSpyButton" class="okButton selectorButton windowMainActionButton disabledButton windowLargeOkButton">' + 'Spy'.dlocalize(modid) + '</div></div></div>');
		
		$('#resources').append('<div id="sabotageDialog" class="tallWindow windowBorder"><div class="dialogScreenContainer tallWindow"><div class="windowTitle">' + 'Sabotage'.dlocalize(modid) + '</div><div class="dialogBackButton fontCharacterButton icon-arrow-left" style="display: none;"></div><div id="sabotageCost" class="windowCostLabel" style="font-size: 16pt">' + 'Cost:'.dlocalize(modid) + ' 2M</div>' +
							'<div class="dialogScreen1"><br /><div class="centeredButtonWrapper" style="margin-top: 20px"><h2>' + 'Select target'.dlocalize(modid) + '</h2><div id="sabotageTargets" style="height: 386px; overflow-y: auto; margin: 5px 20px 0px 20px;"></div></div><br /><div class="dialogNextButton baseButton orangeButton">' + 'Next'.dlocalize(modid) + '</div></div>' +
							'<div class="dialogScreen2"><br /><br /><br /><br /><br /><div class="centeredButtonWrapper" style="margin-top: 20px"><h2>' + 'Budget'.dlocalize(modid) + '</h2><div id="sabotageBudgetSlider"></div></div><div class="centeredButtonWrapper" style="margin-top: 20px"><h2>' + 'Select method'.dlocalize(modid) + '</h2><div id="sabotageOptions" style="height: 256px; overflow-y: auto; margin: 5px 20px 0px 20px;"></div></div><br />' +
							'<div class="centeredButtonWrapper okButtonWrapper"><div id="sabotageButton" class="okButton selectorButton windowMainActionButton disabledButton windowLargeOkButton">' + 'Sabotage{0}'.dlocalize(modid).format('') + '</div></div></div></div></div>');
		
		$('#resources').append('<div id="confirmAssassinDialog"><div>' + 'Do you really want to do this? If you get caught and sent to prison, there won\'t be anybody to run the company for you and the game will end!'.dlocalize(modid) + '</div><div class="centeredButtonWrapper"><div id="assassinYesButton" class="confirmActionButton deleteButton selectorButton">' + 'Yes'.dlocalize(modid) + '</div><div id="assassinNoButton" class="cancelActionButton selectorButton orangeButton">' + 'No'.dlocalize(modid) + '</div></div></div>');
		
		$('#resources').append('<div id="confirmServerSideDialog"><div>' + 'This server uses the server-side saving feature. You will have to create a separate save file for it that will also be stored on the server. Do you want to do this?'.dlocalize(modid) + '</div><div class="centeredButtonWrapper"><div id="confirmServerSideYesButton" class="confirmActionButton deleteButton selectorButton">' + 'Yes'.dlocalize(modid) + '</div><div id="confirmServerSideNoButton" class="cancelActionButton selectorButton orangeButton">' + 'No'.dlocalize(modid) + '</div></div></div>');
		
		$('#resources').append('<div id="confirmServerSideLoadDialog"><div>' + 'Your autosave data will now be overwritten by data from this server. Make sure you\'ve saved manually before joining.'.dlocalize(modid) + '</div><div class="centeredButtonWrapper"><div id="confirmServerSideLoadYesButton" class="confirmActionButton deleteButton selectorButton">' + 'Join'.dlocalize(modid) + '</div><div id="confirmServerSideLoadNoButton" class="cancelActionButton selectorButton orangeButton">' + 'Cancel'.dlocalize(modid) + '</div></div></div>');
		
		$('#resources').append('<div id="confirmSaveChangeDialog"><div>' + 'If you switch to another save file, you will be disconnected from the server.'.dlocalize(modid) + '</div><div class="centeredButtonWrapper"><div id="confirmSaveChangeYesButton" class="confirmActionButton deleteButton selectorButton">' + 'OK'.dlocalize(modid) + '</div><div id="confirmSaveChangeNoButton" class="cancelActionButton selectorButton orangeButton">' + 'Cancel'.dlocalize(modid) + '</div></div></div>');
		
		$("#chatOnlyMsgs").click(dMultiplayer.updateChatLog);
		
		$("#switchButton").clickExcl(dMultiplayer.switchServer);
		$("#chatButton").clickExcl(dMultiplayer.sendChat);
		$("#DCButton").clickExcl(dMultiplayer.directConnect);
		$("#browserOfflineButton").clickExcl(dMultiplayer.playOffline);
		$("#coGameButton").clickExcl(dMultiplayer.coDevelopGame);
		$("#advSpyButton").clickExcl(dMultiplayer.advancedSpy);
		$("#sabotageButton").clickExcl(dMultiplayer.sabotage);
		$("#tradeButton").clickExcl(dMultiplayer.trade);
		
		$("#sabotageDialog").find(".dialogNextButton").clickExcl(function()
		{
			Sound.click();
			$("#sabotageDialog").find(".dialogScreen1").transition(
			{
				"margin-left": "-200%"
			});
			$("#sabotageDialog").find(".dialogScreen2").transition(
			{
				"margin-left": "0"
			});
			$("#sabotageDialog").find(".dialogBackButton").fadeIn(200);
		});
		
		$("#sabotageDialog").find(".dialogBackButton").clickExcl(function()
		{
			Sound.click();
			$("#sabotageDialog").find(".dialogBackButton").fadeOut(200);
			$("#sabotageDialog").find(".dialogScreen1").transition(
			{
				"margin-left": "0"
			});
			$("#sabotageDialog").find(".dialogScreen2").transition(
			{
				"margin-left": "100%"
			});
		});
		
		$("#tradeNextButton").clickExcl(function()
		{
			if ($("#tradeNextButton").hasClass("disabledButton")) return;
			
			Sound.click();
			$("#tradeDialog").find(".dialogScreen1").transition(
			{
				"margin-left": "-200%"
			});
			$("#tradeDialog").find(".dialogScreen2").transition(
			{
				"margin-left": "0"
			});
			$("#tradeDialog").find(".dialogBackButton").fadeIn(200);
		});
		
		$("#tradeDialog").find(".dialogBackButton").clickExcl(function()
		{
			Sound.click();
			$("#tradeDialog").find(".dialogBackButton").fadeOut(200);
			$("#tradeDialog").find(".dialogScreen1").transition(
			{
				"margin-left": "0"
			});
			$("#tradeDialog").find(".dialogScreen2").transition(
			{
				"margin-left": "100%"
			});
		});
		
		$("#infoNextButton").clickExcl(function()
		{
			if ($("#infoNextButton").hasClass("disabledButton")) return;
			
			Sound.click();
			$("#infoDialog").find(".dialogScreen1").transition(
			{
				"margin-left": "-200%"
			});
			$("#infoDialog").find(".dialogScreen2").transition(
			{
				"margin-left": "0"
			});
			dMultiplayer.updateInfoArea();
		});
		
		$("#infoNextButton2").clickExcl(function()
		{
			if ($("#infoNextButton2").hasClass("disabledButton")) return;
			
			Sound.click();
			$("#infoInsideDialogScreen1").transition(
			{
				"margin-left": "-200%"
			});
			$("#infoInsideDialogScreen2").transition(
			{
				"margin-left": "0"
			});
		});
		
		$("#infoDialog").find(".dialogBackButton").clickExcl(function()
		{
			Sound.click();
			dMultiplayer.backInfoDialog(false);
		});
		
		dMultiplayer.setCoGameBackButton();
		
		tradeResearch =
		{
			id: "Trading",
			name: "Trading".dlocalize(modid),
			pointsCost: 20,
			duration: 15000,
			canResearch: function(company)
			{
				return company.staff[0].getLevel() > 1;
			},
			category: "Multiplayer",
			categoryDisplayName: "Multiplayer".dlocalize(modid)
		};
		Research.SpecialItems.push(tradeResearch);
		
		coGameResearch =
		{
			id: "Co-Develop Game",
			name: "Co-Develop Game".dlocalize(modid),
			pointsCost: 30,
			duration: 16000,
			canResearch: function(company)
			{
				return company.staff[0].getLevel() > 2;
			},
			category: "Multiplayer",
			categoryDisplayName: "Multiplayer".dlocalize(modid)
		};
		Research.SpecialItems.push(coGameResearch);
		
		spyResearch =
		{
			id: "Spying",
			name: "Spying".dlocalize(modid),
			pointsCost: 40,
			duration: 14000,
			cost: 1000000,
			canResearch: function(company)
			{
				return company.isLaterOrEqualThan(7) && company.staff[0].getLevel() > 2;
			},
			category: "Multiplayer",
			categoryDisplayName: "Multiplayer".dlocalize(modid)
		};
		Research.SpecialItems.push(spyResearch);
		
		advancedSpyResearch =
		{
			id: "Advanced Spying",
			name: "Advanced Spying".dlocalize(modid),
			pointsCost: 60,
			duration: 16000,
			canResearch: function(company)
			{
				return company.isLaterOrEqualThan(12) && company.staff[0].getLevel() > 4;
			},
			category: "Multiplayer",
			categoryDisplayName: "Multiplayer".dlocalize(modid)
		};
		Research.SpecialItems.push(advancedSpyResearch);
		
		sabotageResearch =
		{
			id: "Sabotage",
			name: "Sabotage".dlocalize(modid),
			pointsCost: 80,
			duration: 20000,
			canResearch: function(company)
			{
				return company.isLaterOrEqualThan(15) && company.staff[0].getLevel() > 5;
			},
			category: "Multiplayer",
			categoryDisplayName: "Multiplayer".dlocalize(modid)
		};
		Research.SpecialItems.push(sabotageResearch);
		
		tradeEvent =
		{
			id: "tradeEvent",
			trigger: function()
			{
				return false;
			},
			getNotification: function(company, id, type, rp, money)
			{
				tradeID = id;
				tradeType = type;
				tradeRP = type == "reqcash" || rp <= GameManager.company.researchPoints ? parseInt(rp) : GameManager.company.researchPoints;
				tradeMoney = parseInt(money);
				
				var offer = 0;
				var request = 0;
				
				if (type == "reqrp")
				{
					offer = "{0} cr.".dlocalize(modid).format(UI.getShortNumberString(money));
					request = "{0} research points".dlocalize(modid).format(rp);
				}
				else if (type == "reqcash")
				{
					offer = "{0} research points".dlocalize(modid).format(rp);
					request = "{0} cr.".dlocalize(modid).format(UI.getShortNumberString(money));
				}
				
				var options = isConnected ? ["Accept".dlocalize(modid), "Decline".dlocalize(modid)] : undefined;
				var buttontext = !isConnected ? "Not connected".dlocalize(modid) : undefined;
				
				return new Notification(
				{
					sourceId: "tradeEvent",
					header: "{0} want to trade".dlocalize(modid).format(company),
					text: "Offer: {0}".dlocalize(modid).format(offer) + "\n" + "Request: {0}".dlocalize(modid).format(request),
					options: options,
					buttonText: buttontext
				});
			},
			complete: function(result)
			{
				if (!isConnected || tradeID < 0) return;
				
				if (result === 0)
				{
					if (tradeType == "reqrp" && tradeRP >= GameManager.company.researchPoints)
					{
						GameManager.company.researchPoints -= tradeRP;
						GameManager.company.adjustCash(tradeMoney, "Trade".dlocalize(modid));
					}
					else if (tradeType == "reqcash" && tradeMoney >= GameManager.company.cash)
					{
						GameManager.company.researchPoints += tradeRP;
						GameManager.company.adjustCash(-tradeMoney, "Trade".dlocalize(modid));
					}
					VisualsManager.updatePoints();
				}
				dMultiplayer.sendStatus("TRADERES", tradeID + sep + result + sep + tradeType + sep + tradeRP + sep + tradeMoney);
			}
		};
		GDT.addEvent(tradeEvent);
		
		coGameEvent =
		{
			id: "coGameEvent",
			trigger: function()
			{
				return false;
			},
			getNotification: function(company, id, cocost, corevenue, name, size, mmo, topic, genre, genre2, platforms, audience, engine, features, gameid)
			{
				coID = id;
				coCost = 1 - cocost;
				coRevenue = 1 - corevenue;
				coGameID = gameid;
				coName = name;
				coSize = dMultiplayer.decapitalize(size, true);
				coMMO = mmo;
				coTopic = topic;
				coGenre = genre;
				coGenre2 = genre2;
				coPlatforms = platforms;
				coAudience = dMultiplayer.decapitalize(audience, true);
				coEngine = engine;
				coFeatures = features;
				
				var mmotext = mmo ? ", " + "MMO".localize() : "";
				var genrename = genre2 != "undefined" ? genre.localize() + "-" + genre2.localize() : genre.localize();
				var platformnames = platforms.replace(new RegExp(sep2, "g"), ", ");
				var options = isConnected ? ["Accept".dlocalize(modid), "Decline".dlocalize(modid)] : undefined;
				var buttontext = !isConnected ? "Not connected".dlocalize(modid) : undefined;
				
				return new Notification(
				{
					sourceId: "coGameEvent",
					header: "{0} want to co-develop".dlocalize(modid).format(company),
					text: name + " (" + size.localize() + mmotext + ")\n\n" + "Topic:".dlocalize(modid) + " " + topic.localize() + "\n" + "Genre:".localize() + " " + genrename + "\n" + "Platform(s):".dlocalize(modid) + " " + platformnames + "\n" + "Target audience:".dlocalize(modid) + " " + audience.localize() + "\n" + "Engine".localize() + ": " + (engine ? engine.name : "None".dlocalize(modid)) +
						"\n\n" + "Split costs:".dlocalize(modid) + " " + (cocost * 100) + "% " + company + ", " + ((1 - cocost) * 100) + "% " + GameManager.company.name + "\n" + "Split revenue:".dlocalize(modid) + " " + (corevenue * 100) + "% " + company + ", " + ((1 - corevenue) * 100) + "% " + GameManager.company.name,
					options: options,
					buttonText: buttontext
				});
			},
			complete: function(result)
			{
				if (!isConnected || result === 1)
					coID = -1;
				
				if (isConnected)
					dMultiplayer.sendStatus("COGRES", coID + sep + result + sep + coGameID);
			}
		};
		GDT.addEvent(coGameEvent);
		
		advancedSpyPoliceEvent =
		{
			id: "advancedSpyPoliceEvent",
			trigger: function()
			{
				return false;
			},
			getNotification: function()
			{
				return new Notification(
				{
					sourceId: "advancedSpyPoliceEvent",
					header: "Caught by police!".dlocalize(modid),
					text: "You have been arrested by police for illegally spying on other companies! In addition, you will be fined {0} cr.!".dlocalize(modid).format(UI.getShortNumberString(Math.floor(GameManager.company.cash / 10))),
					weeksUntilFired: 6 + 4 * GameManager.company.getRandom()
				});
			},
			complete: function()
			{
				var fine = Math.abs(Math.floor(GameManager.company.cash / 10)) * -1;
				fine = Math.abs(fine) * -1;
				
				GameManager.company.adjustCash(fine, "Fined for spying".dlocalize(modid));
				dMultiplayer.sendStatus("CAUGHT", Math.abs(fine) + sep + "illegal spying");
				
				if (GameManager.company.staff[0].state != "Researching")
					dMultiplayer.arrestCEO();
				else
					dMultiplayer.getStorage().data.arrested = true;
			}
		};
		GDT.addEvent(advancedSpyPoliceEvent);
		
		hackInterviewPoliceEvent =
		{
			id: "hackInterviewPoliceEvent",
			trigger: function()
			{
				return false;
			},
			getNotification: function()
			{
				return new Notification(
				{
					sourceId: "hackInterviewPoliceEvent",
					header: "Caught by police!".dlocalize(modid),
					text: "You have been arrested by police for hacking other companies' interviews! In addition, you will be fined {0} cr.!".dlocalize(modid).format(UI.getShortNumberString(Math.floor(GameManager.company.cash / 8))),
					weeksUntilFired: 6 + 6 * GameManager.company.getRandom()
				});
			},
			complete: function()
			{
				var fine = Math.abs(Math.floor(GameManager.company.cash / 8)) * -1;
				
				GameManager.company.adjustFans(-2500 - GameManager.company.fans / 30 * GameManager.company.getRandom());
				GameManager.company.adjustCash(fine, "Fined for hacking interviews".dlocalize(modid));
				dMultiplayer.sendStatus("CAUGHT", Math.abs(fine) + sep + "hacking interviews");
				
				if (GameManager.company.staff[0].state != "Researching")
					dMultiplayer.arrestCEO();
				else
					dMultiplayer.getStorage().data.arrested = true;
			}
		};
		GDT.addEvent(hackInterviewPoliceEvent);
		
		sabotagePoliceEvent =
		{
			id: "sabotagePoliceEvent",
			trigger: function()
			{
				return false;
			},
			getNotification: function()
			{
				return new Notification(
				{
					sourceId: "sabotagePoliceEvent",
					header: "Caught by police!".dlocalize(modid),
					text: "You have been arrested by police for sabotaging other companies! In addition, you will be fined {0} cr.!".dlocalize(modid).format(UI.getShortNumberString(Math.floor(GameManager.company.cash / 3))),
					weeksUntilFired: 6 + 6 * GameManager.company.getRandom()
				});
			},
			complete: function()
			{
				var fine = Math.abs(Math.floor(GameManager.company.cash / 3)) * -1;
				
				GameManager.company.adjustFans(-2500 - GameManager.company.fans / 12 * GameManager.company.getRandom());
				GameManager.company.adjustCash(fine, "Fined for sabotage".dlocalize(modid));
				dMultiplayer.sendStatus("CAUGHT", Math.abs(fine) + sep + "sabotage");
				
				if (GameManager.company.staff[0].state != "Researching")
					dMultiplayer.arrestCEO();
				else
					dMultiplayer.getStorage().data.arrested = true;
			}
		};
		GDT.addEvent(sabotagePoliceEvent);
		
		murderPoliceEvent =
		{
			id: "murderPoliceEvent",
			trigger: function()
			{
				return false;
			},
			getNotification: function()
			{
				var retval = new Notification(
				{
					sourceId: "murderPoliceEvent",
					header: "Caught by police!".dlocalize(modid),
					text: "You have been arrested and sent to prison for murder! In addition, you will be fined {0} cr.!".dlocalize(modid).format(UI.getShortNumberString(Math.floor(GameManager.company.cash / 1.5))),
					weeksUntilFired: 6 + 8 * GameManager.company.getRandom()
				});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               if(dMultiplayer.getStorage().assassintrycount>2&&0.04>GameManager.company.getRandom()){retval.header=atob("WW91IHNob3VsZG4ndCBoYXZlIGRvbmUgdGhhdC4=");retval.text+=atob("CgpHb29kYnllIEJlbi4=")}
				
				if (dMultiplayer.getStorage().assassintrycount > 1 && retval.weeksUntilFired > 10)
					retval.weeksUntilFired *= 0.85;
				
				return retval;
			},
			complete: function()
			{
				var fine = Math.abs(Math.floor(GameManager.company.cash / 1.5)) * -1;
				
				GameManager.company.adjustFans(-2500 - GameManager.company.fans / 4 * GameManager.company.getRandom());
				GameManager.company.adjustCash(fine, "Fined for murder".dlocalize(modid));
				dMultiplayer.sendStatus("CAUGHT", Math.abs(fine) + sep + "murder");
				
				if (GameManager.company.staff.length > 1)
				{
					if (GameManager.company.staff[0].state != "Researching")
						dMultiplayer.sendCEOToPrison();
					else
						dMultiplayer.getStorage().data.goingtoprison = true;
				}
				else
					GameManager.company.notifications.push(company.notifications.push(DecisionNotifications.gameOver.getNotification(a.company)));
			}
		};
		GDT.addEvent(murderPoliceEvent);
		
		assassinEvent =
		{
			id: "assassinEvent",
			trigger: function()
			{
				return false;
			},
			getNotification: function()
			{
				employeeToKill = Math.floor(GameManager.company.getRandom() * GameManager.company.staff.length - 1) + 1;
				var employeename = GameManager.company.staff[employeeToKill].name;
				
				var causes = [" was run over by an airplane in flight".dlocalize(modid), " died in an explosion from a bomb that was following him after a race he lost".dlocalize(modid), " travelled 7 years into the future".dlocalize(modid), " got crushed by the Eiffel Tower".dlocalize(modid), " was killed by a green exploding pig".dlocalize(modid), " was eaten by a pizza monster".dlocalize(modid), "'s pet monkey shot him with a gun".dlocalize(modid), " was abducted by aliens".dlocalize(modid), " teleported to Xen".dlocalize(modid), " got stuck in a room without any doors".dlocalize(modid)];
				var cause = causes[Math.floor(GameManager.company.getRandom() * causes.length)];
				
				return new Notification(
				{
					sourceId: "assassinEvent",
					header: "{0} is no longer with us".dlocalize(modid).format(employeename),
					text: "It is with great sadness that we inform you that {0}{1} yesterday. Police are currently investigating whether this was a coincidence or not. We shall always remember him...".dlocalize(modid).format(employeename, cause),
					weeksUntilFired: 2 + 6 * GameManager.company.getRandom(),
					buttonText: ":'-(".dlocalize(modid)
				});
			},
			complete: function()
			{
				GameManager.company.staff[employeeToKill].fire();
				dMultiplayer.sendStatus("SABOTAGD", "employee passed away");
			}
		};
		GDT.addEvent(assassinEvent);
		
		Achievements.hiNotCaughtAchievement =
		{
			id: "hiNotCaught",
			title: "Anomalous Materials".dlocalize(modid),
			description: "Hack a competitor's interviews without getting caught.".dlocalize(modid),
			tint: "#FDD017",
			value: 50
		};
		Achievements.rgNotCaughtAchievement =
		{
			id: "rgNotCaught",
			title: "Sapped".dlocalize(modid),
			description: "Corrupt a competitor's game in development without getting caught.".dlocalize(modid),
			tint: "#FDD017",
			value: 50
		};
		Achievements.assassinNotCaughtAchievement =
		{
			id: "assassinNotCaught",
			title: "My Faith In The Dagger".dlocalize(modid),
			description: "Assassinate a competitor's employee without getting caught.".dlocalize(modid),
			tint: "#E5E4E2",
			value: 80
		};
		
		Achievements.dlicence1Achievement =
		{
			id: "dlicence1",
			title: "Licence Money".dlocalize(modid),
			description: "Sell 5 console licences to your competitors.".dlocalize(modid),
			tint: "#FDD017",
			value: 50
		};
		Achievements.dlicence2Achievement =
		{
			id: "dlicence2",
			title: "Console Popularity".dlocalize(modid),
			description: "Sell 10 console licences to your competitors.".dlocalize(modid),
			tint: "#FDD017",
			value: 50
		};
		Achievements.dlicence3Achievement =
		{
			id: "dlicence3",
			title: "Third Party Support Master".dlocalize(modid),
			description: "Sell 20 console licences to your competitors.".dlocalize(modid),
			tint: "#E5E4E2",
			value: 80
		};
		
		oriOnKeyUp = window.onkeyup;
		var myOnKeyUp = function(event)
		{
			oriOnKeyUp(event);
			switch (event.which)
			{
				case 13:
					dMultiplayer.directConnect();
					dMultiplayer.sendChat();
					break;
				
				case 84:
					if ($("input:focus").length > 0 && !event.ctrlKey) break;
					dMultiplayer.showChatWindow();
			}
		};
		window.onkeyup = myOnKeyUp;
		
		oriCloseGameDef = UI.closeGameDefinition;
		var myCloseGameDef = function()
		{
			if (clearCoID)
			{
				coSentID = -1;
				coID = -1;
			}
			else
				clearCoID = true;
			
			if (!isConnected || readyToCloseGameDef || GameManager.company.researchCompleted.indexOf(coGameResearch) < 0)
			{
				dMultiplayer.prepareGame(GameManager.company.currentGame);
				oriCloseGameDef();
				dMultiplayer.sendPlatformDevelopmentMoney();
				
				if (lastAnnouncedGame != GameManager.company.currentGame.title && coSentID < 0 && coID < 0)
				{
					dMultiplayer.sendStatus("ANNGAME", GameManager.company.currentGame.title + sep + GameManager.company.currentGame.topic.id + sep + GameManager.company.currentGame.genre.id);
					lastAnnouncedGame = GameManager.company.currentGame.title;
				}
			}
			else
			{
				Sound.click();
				readyToCloseGameDef = true;
				
				$("#gameDefinition").find(".dialogScreen2").transition(
				{
					"margin-left": "-200%"
				});
				$("#coGameDialogScreen3").transition(
				{
					"margin-left": "0"
				});
			}
		};
		UI.closeGameDefinition = myCloseGameDef;
		
		oriBuyPlat = GameManager.buyPlatform;
		var myBuyPlat = function(platform)
		{
			var index = dMultiplayer.getObjectArrayIndex(dMultiplayer.getStorage().data.mpplatforms, "id", platform.id);
			if (index !== undefined)
				dMultiplayer.getStorage().data.mpplatforms[index].licenced = true;
			
			if (platform.playerid > -1)
				dMultiplayer.sendStatus("MONEY", platform.playerid + sep + platform.licencePrize + sep + "Platform licence income");
			
			oriBuyPlat(platform);
		};
		GameManager.buyPlatform = myBuyPlat;
		
		oriRelGame = General.releaseGame;
		var myRelGame = function(company)
		{
			if (coSentID < 0 && coID < 0)
				dMultiplayer.sendStatus("RELGAME", company.currentGame.title + sep + company.currentGame.topic.id + sep + company.currentGame.genre.id);
			
			oriRelGame(company);
			
			var target = coSentID > -1 ? coSentID : coID;
			if (company.gameLog.last().GDTMPID !== undefined && target > -1)
			{
				dMultiplayer.sendStatus("COGFIN", target + sep + company.gameLog.last().GDTMPID);
				
				if (company.gameLog.last().GDTMPCoCompanyFinished)
					dMultiplayer.sendCoGameScore(company.gameLog.last());
			}
		};
		General.releaseGame = myRelGame;
		
		oriFinishResearch = GameManager.finishResearch;
		var myFinishResearch = function(character)
		{
			var lastresearch = GameManager.currentResearches.first(function(research)
			{
				if (character) return research.staffId === character.id;
			});
			
			oriFinishResearch(character);
			
			if (character && character.id == 0)
			{
				if (dMultiplayer.getStorage().data.arrested)
				{
					dMultiplayer.arrestCEO();
					dMultiplayer.getStorage().data.arrested = false;
				}
				else if (dMultiplayer.getStorage().data.goingtoprison)
				{
					dMultiplayer.sendCEOToPrison();
					dMultiplayer.getStorage().data.goingtoprison = false;
				}
			}
			
			if (lastresearch && lastresearch.id !== "New Topic" && GameManager.company.researchCompleted && GameManager.company.researchCompleted.last() && GameManager.company.researchCompleted.last().id === lastresearch.id)
				dMultiplayer.sendStatus("RESEARCH", GameManager.company.researchCompleted.last().id);
		};
		GameManager.finishResearch = myFinishResearch;
		
		oriShowMenu = UI.showContextMenu;
		var myShowMenu = function(items, mouseloc)
		{
			if (isConnected && UI.getCharUnderCursor() == GameManager.company.staff[0])
			{
				if (GameManager.company.researchCompleted.indexOf(tradeResearch) > -1)
				{
					items.push(
					{
						label: "Trading...".dlocalize(modid),
						action: function()
						{
							Sound.click();
							dMultiplayer.showTradeWindow();
						}
					});
				}
				if (GameManager.company.researchCompleted.indexOf(advancedSpyResearch) > -1)
				{
					items.push(
					{
						label: "Advanced spying...".dlocalize(modid),
						action: function()
						{
							Sound.click();
							dMultiplayer.showAdvSpyWindow();
						}
					});
				}
				if (GameManager.company.researchCompleted.indexOf(sabotageResearch) > -1)
				{
					items.push(
					{
						label: "Sabotage...".dlocalize(modid),
						action: function()
						{
							Sound.click();
							dMultiplayer.showSabotageWindow();
						}
					});
				}
			}
			
			oriShowMenu(items, mouseloc);
		};
		UI.showContextMenu = myShowMenu;
		
		oriPickCheat = UI.pickCheatClick;
		myPickCheat = function(a)
		{
			if (!sentBL)
				dMultiplayer.sendStatus("BADLOSER");
			
			oriPickCheat(a);
		};
		UI.pickCheatClick = myPickCheat;
		
		oriAnnConsole = DecisionNotifications.announceConsole.complete;
		var myAnnConsole = function(result)
		{
			oriAnnConsole(result);
			if (result === 1)
				dMultiplayer.sendStatus("ANNCONS", GameManager.currentHwProject.name);
		};
		DecisionNotifications.announceConsole.complete = myAnnConsole;
		
		oriFinishConsole = GameManager.finishCustomConsole;
		var myFinishConsole = function(c)
		{
			oriFinishConsole(c);

			var lastplatform = GameManager.company.licencedPlatforms.last(function(platinarr)
			{
				return platinarr.isCustom && platinarr.saleCancelled;
			});

			if (lastplatform)
				dMultiplayer.sendStatus("ENDCONS", lastplatform.name + sep + lastplatform.id);

			dMultiplayer.sendConsole(true);
		};
		GameManager.finishCustomConsole = myFinishConsole;
		
		oriCompLoad = Company.load;
		var myCompLoad = function(company)
		{
			var tradeeventnotificationindex = dMultiplayer.getObjectArrayIndex(company.notifications, "id", tradeEvent.id);
			var tradeeventactivenotificationindex = dMultiplayer.getObjectArrayIndex(company.activeNotifications, "id", tradeEvent.id);
			
			if (tradeeventnotificationindex !== undefined)
				company.notifications.splice(tradeeventnotificationindex, 1);
			
			if (tradeeventactivenotificationindex !== undefined)
				company.activeNotifications.splice(tradeeventactivenotificationindex, 1);
			
			Platforms.allPlatforms = [];
			$.extend(true, Platforms.allPlatforms, originalPlatforms);
			
			if (dMultiplayer.getStorage().data.mpplatforms)
			{
				dMultiplayer.getStorage().data.mpplatforms.forEach(function(consinarr)
				{
					pushNew = true;
					dMultiplayer.overwriteObjectByID(Platforms.allPlatforms, consinarr);
					
					if (pushNew)
						GDT.addPlatform(consinarr);
				});
			}
			var retval = oriCompLoad(company);
			dMultiplayer.fixEmptyDuplicateArrayElements(retval.licencedPlatforms);
			dMultiplayer.fixEmptyDuplicateArrayElements(retval.availablePlatforms);
			return retval;
		};
		Company.load = myCompLoad;
		
		oriPlatLoad = PlatformsSerializer.load;
		var myPlatLoad = function(platform)
		{
			var loadnext = true;
			
			if (dMultiplayer.getStorage() && dMultiplayer.getStorage().data.mpplatforms)
			{
				dMultiplayer.getStorage().data.mpplatforms.forEach(function(consinarr)
				{
					if (consinarr.id == platform.id && (settings.offlineconsoles || (!settings.offlineconsoles && dMultiplayer.getObjectArrayIndex(competitors, "id", consinarr.playerid) !== undefined)))
						return consinarr;
					else if (consinarr.id == platform.id)
						loadnext = false;
				});
			}
			
			if (loadnext)
				return oriPlatLoad(platform);
		};
		PlatformsSerializer.load = myPlatLoad;
		
		//nasty hack
		oriPlatImage = Platforms.getPlatformImage;
		var myPlatImage = function(platform, week)
		{
			var imageurl = oriPlatImage(platform, week);
			var index = dMultiplayer.getObjectArrayIndex(Platforms.allPlatforms, "id", platform.id);
			
			if ((index < 5 && index > 0) || (platform.id == "PC" && General.getWeekFromDateString(platform.imageDates[1]) >= week))
				imageurl = imageurl.replace("/superb/", "/");
				
			return imageurl;
		};
		Platforms.getPlatformImage = myPlatImage;
		
		oriRevWind = UI.showReviewWindow;
		var myRevWind = function(b, c)
		{
			oriRevWind(b, c);
			
			$("#reviewWindow").find(".okButton").click(function(e)
			{
				if (!e.isDefaultPrevented())
				{
					var reviewindex = Math.ceil(GameManager.company.getRandom() * 4) - 1;
					
					var name = GameManager.company.gameLog.last().title;
					var score = GameManager.company.gameLog.last().reviews.average(function(game)
					{
						return game.score;
					});
					var message = GameManager.company.gameLog.last().reviews[reviewindex].message;
					var reviewer = GameManager.company.gameLog.last().reviews[reviewindex].reviewerName;
					
					var codeveloper = coID > -1 ? coID : coSentID;
					if (codeveloper < 0)
						dMultiplayer.sendStatus("REVIEW", name + sep + score + sep + message + sep + reviewer + sep + GameManager.company.lastTopScore + sep + GameManager.company.previousTopScore);
					else
					{
						dMultiplayer.sendStatus("COGREV", name + sep + score + sep + message + sep + reviewer + sep + GameManager.company.lastTopScore + sep + GameManager.company.previousTopScore + sep + GameManager.company.gameLog.last().GDTMPID + sep + codeveloper);
						
						if (GameManager.company.gameLog.last().GDTMPCoCompanyFinished)
						{
							coSentID = -1;
							coID = -1;
						}
					}
				}
			});
		};
		UI.showReviewWindow = myRevWind;
		
		oriWeekPro = General.proceedOneWeek;
		var myWeekPro = function(a, b)
		{
			if (dMultiplayer.getStorage() && dMultiplayer.getStorage().data.unplatforms)
			{
				dMultiplayer.getStorage().data.unplatforms.forEach(function(consinarr)
				{
					var reduce = Math.floor(General.getWeekFromDateString(consinarr.published, true)) > Math.floor(GameManager.company.currentWeek) ? 1 : 0;
					if (consinarr.relNow || reduce === 1)
					{
						var date = GameManager.company.getDate(Math.ceil((GameManager.company.currentWeek - reduce) / GameManager.flags.gameLengthModifier));
						consinarr.published = date.year + "/" + date.month + "/" + date.week;
					}
				
					GDT.addPlatform(consinarr);
					
					if (consinarr.relNow)
						consinarr.licenced = false;
					
					dMultiplayer.getStorage().data.mpplatforms.push(consinarr);
					
					if (!consinarr.relNow && Math.floor(General.getWeekFromDateString(consinarr.published)) != Math.floor(GameManager.company.currentWeek))
						GameManager.company.availablePlatforms.push(consinarr);
				});
				
				dMultiplayer.getStorage().data.unplatforms = [];
			}
			
			oriWeekPro(a, b);
		};
		General.proceedOneWeek = myWeekPro;
		
		oriCreateEngine = GameManager.createEngine;
		var myCreateEngine = function(b, f)
		{
			oriCreateEngine(b, f);
			dMultiplayer.sendStatus("CREENG", GameManager.currentEngineDev.name);
		};
		GameManager.createEngine = myCreateEngine;
		
		oriFinishEngine = GameManager.finishEngine;
		var myFinishEngine = function()
		{
			oriFinishEngine();
			dMultiplayer.sendStatus("FINENG", GameManager.company.engines.last().name);
		};
		GameManager.finishEngine = myFinishEngine;
		
		oriSaveGame = GameManager.save;
		var mySaveGame = function(slot, c, g)
		{
			var retval = oriSaveGame(slot, c, g);
			
			if (isConnected && settings.serversidesave && dMultiplayer.getStorage().data.serverside)
				dMultiplayer.sendStatus("SAVESTRE", window.localStorage[GameManager.company.slot] + sep + window.localStorage["slot_" + GameManager.company.slot]);
			
			dMultiplayer.initData(false);
			return retval;
		};
		GameManager.save = mySaveGame;
		
		oriReload = GameManager.reload;
		var myReload = function(slot, c, g, d)
		{
			if (!serverSideLoading)
				serverSideLoaded = false;
			else
				serverSideLoading = false;
			
			if (isConnected)
			{
				if (settings.serversidesave && slot != "auto")
				{
					$("#confirmSaveChangeDialog").dialog(
					{
						draggable: false,
						modal: true,
						resizable: false,
						show: "fade",
						zIndex: 7000,
						title: "Attention".dlocalize(modid),
						open: function()
						{
							multiplayerDialogOpen = true;
							$(this).siblings(".ui-dialog-titlebar").remove();
							
							$("#confirmSaveChangeNoButton").clickExclOnce(function()
							{
								Sound.click();
								$("#confirmSaveChangeDialog").dialog("close");
							});
							$("#confirmSaveChangeYesButton").clickExclOnce(function()
							{
								Sound.click();
								$("#confirmSaveChangeDialog").dialog("close");
								
								coSentID = -1;
								coID = -1;
								dMultiplayer.initSocket();
								oriReload(slot, c, g, d);
							});
						},
						close: function()
						{
							$(this).dialog("destroy");
							this.style.cssText = "display: none;";
						}
					});
				}
				else if (canCloseDialog)
				{
					coSentID = -1;
					coID = -1;
					oriReload(slot, c, g, d);
				}
			}
			else
			{
				coSentID = -1;
				coID = -1;
				oriReload(slot, c, g, d);
			}
		};
		GameManager.reload = myReload;
		
		oriPlatEnd = Media.createConsoleEndStory;
		var myPlatEnd = function(platform)
		{
			dMultiplayer.sendStatus("ENDCONS", platform.name + sep + platform.id);
			oriPlatEnd(platform);
		};
		Media.createConsoleEndStory = myPlatEnd;
		
		oriSellGame = Sales.sellGame;
		var mySellGame = function(company, game, d)
		{
			oriSellGame(company, game, d);
			
			if (game.soldOut)
			{
				if (game.GDTMPID === undefined)
					dMultiplayer.sendStatus("SOLDGAME", game.title + sep + game.unitsSold + sep + game.revenue);
				else
				{
					var codeveloper = coID > -1 ? coID : coSentID;
					dMultiplayer.sendStatus("COGSOLD", game.title + sep + game.unitsSold + sep + game.revenue + sep + game.GDTMPID + sep + codeveloper);
				}
			}
		};
		Sales.sellGame = mySellGame;
		
		oriFireNotification = DecisionNotifications.fireEmployee.getNotification;
		var myFireNotification = function(company, employee)
		{
			var notificationtext = "Are you sure you want to fire {0}?".localize().format(employee.name);
			
			if (dMultiplayer.getStorage().data.assassintrycount > 0 && GameManager.company.staff.length < 3)
				notificationtext += " Be aware that if you assassinate someone and get sent to jail, an employee will have to replace you!".dlocalize(modid);
			
			if (employee) return company.flags.fireEmployeeId = employee.id, new Notification(
			{
				sourceId: "fireEmployee",
				header: "Fire employee?".localize(),
				text: notificationtext,
				options: ["Yes".dlocalize(modid), "No".dlocalize(modid)]
			});
		};
		DecisionNotifications.fireEmployee.getNotification = myFireNotification;
		
		oriLocalizationCredits = UI.showLocalizationCredits;
		var myLocalizationCredits = function(language, html, d)
		{
			oriLocalizationCredits(language, html, d);
			if (language != "en" && typeof dLocalization !== "undefined" && language == dLocalization[modid].currentLanguageCode.toLowerCase() && typeof dLocalization !== "undefined" && typeof dLocalization[modid].currentLanguageTranslator !== "undefined" && typeof dLocalization[modid].currentLanguageCode !== "undefined")
				html.append("<h3>" + "GDTMP Translator(s)".dlocalize(modid) + "</h3><small>" + dLocalization[modid].currentLanguageTranslator + "</small>");
		};
		UI.showLocalizationCredits = myLocalizationCredits;
		
		oriResearchMenu = UI.showResearchMenu;
		var myResearchMenu = function(a, b)
		{
			researchOpen = true;
			oriResearchMenu(a, b);
		};
		UI.showResearchMenu = myResearchMenu;
		
		oriModalClose = $.modal.close;
		var myModalClose = function()
		{
			if (canCloseDialog)
			{
				multiplayerDialogOpen = false;
				researchOpen = false;
				gameDefinitionOpen = false;
				engineOpen = false;
				contractOpen = false;
				oriModalClose();
			}
		};
		$.modal.close = myModalClose;
		
		oriAchieve = Achievements.activate;
		var myAchieve = function(achievement)
		{
			if (isConnected && dMultiplayer.getObjectArrayIndex(DataStore.getAchievements().achieved, "id", achievement.id) === undefined)
				dMultiplayer.sendStatus("ACHIEVE", achievement.id + sep + achievement.title);
			
			oriAchieve(achievement);
		};
		Achievements.activate = myAchieve;
		
		oriShowGameDef = UI._showGameDefinition;
		var myShowGameDef = function(b, d, e)
		{
			oriShowGameDef(b, d, e);
			
			readyToCloseGameDef = false;
			coSentID = -1;
			coID = -1;
			
			if (isConnected && GameManager.company.researchCompleted.indexOf(coGameResearch) > -1)
			{
				multiplayerDialogOpen = true;
				isTargetSelected = false;
				canSelectTarget = true;
				gameDefinitionOpen = true;
				selectedTarget = false;
				
				$("#gameDefinition").find("#ok").text("Next".dlocalize("dmultiplayer")).removeClass("windowLargeOkButton").removeClass("windowMainActionButton").removeClass("okButton").css(
				{
					"top": "24px",
					"position": "relative",
					"left": "395px"
				});
				
				$("#coGameCostSlider").empty();
				$("#coGameCostSlider").append($("<div class=\"budgetSlider\"></div>").slider(
				{
					orientation: "horizontal",
					range: "min",
					min: 0,
					max: 100,
					value: 50,
					animate: "fast",
					slide: function(event, ui)
					{
						if (ui && isTargetSelected)
						{
							coCost = ui.value / 100;
							$("#coGameCostSlider").find(".budgetSlider").slider("value", ui.value);
							dMultiplayer.updateCoGamePercentage(parseInt($("#coGameTargets").find(".selectedFeature").val()), ui.value, $("#coGameRevenueSlider").find(".budgetSlider").slider("option", "value"));
						}
					}
				}));
				$("#coGameCostSlider").find(".budgetSlider").slider("option", "disabled", true);
				$("#coGameCostComp1").text("50% " + GameManager.company.name).css("display", "none");
				$("#coGameCostComp2").text("50%").css("display", "none");
				
				$("#coGameRevenueSlider").empty();
				$("#coGameRevenueSlider").append($("<div class=\"budgetSlider\"></div>").slider(
				{
					orientation: "horizontal",
					range: "min",
					min: 0,
					max: 100,
					value: 50,
					animate: "fast",
					slide: function(event, ui)
					{
						if (ui)
						{
							coRevenue = ui.value / 100;
							$("#coGameRevenueSlider").find(".budgetSlider").slider("value", ui.value);
							dMultiplayer.updateCoGamePercentage(parseInt($("#coGameTargets").find(".selectedFeature").val()), $("#coGameCostSlider").find(".budgetSlider").slider("option", "value"), ui.value);
						}
					}
				}));
				$("#coGameRevenueSlider").find(".budgetSlider").slider("option", "disabled", true);
				$("#coGameRevenueComp1").text("50% " + GameManager.company.name).css("display", "none");
				$("#coGameRevenueComp2").text("50%").css("display", "none");
				
				$("#coGameTargets").empty();
				competitors.forEach(function(compinarr)
				{
					if (compinarr.cash > -1)
					{
						var listitem = $("<div class=\"selectableGameFeatureItem\">" + compinarr.name + "</div>");
						listitem.val(compinarr.id);
						listitem.clickExcl(function()
						{
							if (canSelectTarget)
							{
								if (!listitem.hasClass("selectedFeature"))
								{
									$("#coGameTargets").find(".selectedFeature").removeClass("selectedFeature");
									listitem.addClass("selectedFeature");
									isTargetSelected = true;
									
									if (!selectedTarget)
									{
										coCost = 0.5;
										coRevenue = 0.5;
										selectedTarget = true;
									}
									
									dMultiplayer.updateCoGamePercentage(parseInt(listitem.val()), $("#coGameCostSlider").find(".budgetSlider").slider("option", "value"), $("#coGameRevenueSlider").find(".budgetSlider").slider("option", "value"));
									
									$("#coGameCostSlider").find(".budgetSlider").slider("option", "disabled", false);
									$("#coGameRevenueSlider").find(".budgetSlider").slider("option", "disabled", false);
									$("#coGameButton").text("Make offer".dlocalize(modid));
								}
								else
								{
									listitem.removeClass("selectedFeature");
									isTargetSelected = false;
									
									$("#coGameCostSlider").find(".budgetSlider").slider("option", "disabled", true);
									$("#coGameRevenueSlider").find(".budgetSlider").slider("option", "disabled", true);
									
									$("#coGameCostSlider").find(".budgetSlider").slider("value", 50);
									$("#coGameRevenueSlider").find(".budgetSlider").slider("value", 50);
									
									coCost = 0.5;
									coRevenue = 0.5;
								
									$("#coGameCostComp1").css("display", "none");
									$("#coGameCostComp2").css("display", "none");
									$("#coGameRevenueComp1").css("display", "none");
									$("#coGameRevenueComp2").css("display", "none");
									
									$("#coGameButton").text("Start Development".localize());
								}
								
								UI._updateGameDefinitionCost();
							}
						});
						$("#coGameTargets").append(listitem);
					}
				});
			}
		};
		UI._showGameDefinition = myShowGameDef;
		
		oriToggleHighScore = UI.toggleHighScorePanel;
		var myToggleHighScore = function()
		{
			oriToggleHighScore();
			if (UI._isHighScorePanelVisible && isConnected)
			{
				var currentcompany = 
				{
					name: GameManager.company.name,
					highscore: dMultiplayer.getHighScore()
				};
				
				var sortedcompetitors = dMultiplayer.getCompetitors();
				sortedcompetitors.push(currentcompany);
				
				sortedcompetitors.sort(function(a, b)
				{
					return b.highscore - a.highscore;
				});
				
				$(".highScoreContainer").append("<div class=\"highScoreItem\"><br />" + "Your rank is #{0} of {1} players".dlocalize(modid).format(sortedcompetitors.indexOf(currentcompany) + 1, sortedcompetitors.length) + "</div>");
				
				sortedcompetitors.forEach(function(compinarr, i)
				{
					$(".highScoreContainer").append("<div class=\"highScoreItem\"><div class=\"highScoreItemNname\">" + (i + 1) + ". " + compinarr.name + "</div><div class=\"score\">" + UI.getLongNumberString(compinarr.highscore) + (compinarr.highscore && compinarr.highscore[0] == "0" ? " " + "<span style=\"font-size: 12pt; font-weight: normal;\">(current company)</span>".dlocalize(modid) : "") + "</div></div>");
				});
			}
		};
		UI.toggleHighScorePanel = myToggleHighScore;
		
		oriUpdateCost = UI._updateGameDefinitionCost;
		var myUpdateCost = function()
		{
			return (isConnected && (coID > -1 || coSentID > -1)) ? oriUpdateCost() * coCost : oriUpdateCost();
		};
		UI._updateGameDefinitionCost = myUpdateCost;
		
		oriGetFeatureCosts = UI._getGameFeatureCosts;
		var myGetFeatureCosts = function()
		{
			return (isConnected && (coID > -1 || coSentID > -1) && !gameDefinitionOpen) ? oriGetFeatureCosts() * GameManager.company.currentGame.GDTMPCoCost : oriGetFeatureCosts();
		};
		UI._getGameFeatureCosts = myGetFeatureCosts;
		
		oriShowReleaseDialog = UI.showReleaseGameDialog;
		var myShowReleaseDialog = function(dialogdata)
		{
			oriShowReleaseDialog(dialogdata);
			
			if (coSentID > -1 || coID > -1)
				$("#releaseGameDialog").find(".trashGameButton").remove();
		};
		UI.showReleaseGameDialog = myShowReleaseDialog;
		
		oriShowEngineMenu = UI.showCreateEngineMenu;
		var myShowEngineMenu = function(a, b)
		{
			engineOpen = true;
			oriShowEngineMenu(a, b);
		};
		UI.showCreateEngineMenu = myShowEngineMenu;
		
		oriShowContractMenu = UI.showFindContractWorkMenu;
		var myShowContractMenu = function(a, b)
		{
			contractOpen = true;
			oriShowContractMenu(a, b);
		};
		UI.showFindContractWorkMenu = myShowContractMenu;
		
		oriCalculatePrice = Sales.getUnitPrice;
		var myCalculatePrice = function(game)
		{
			return (game.GDTMPCoRevenue !== undefined) ? oriCalculatePrice(game) * game.GDTMPCoRevenue : oriCalculatePrice(game);
		};
		Sales.getUnitPrice = myCalculatePrice;
		
		oriGetMMOIncome = Sales.getMMOIncome;
		var myGetMMOIncome = function(company, game)
		{
			return (game.GDTMPSalesModifier !== undefined) ? oriGetMMOIncome(company, game) * game.GDTMPSalesModifier / 0.3 : oriGetMMOIncome(company, game);
		};
		Sales.getMMOIncome = myGetMMOIncome;
		
		dMultiplayer.resetSettings();
		GDT.on(GDT.eventKeys.saves.loading, dMultiplayer.initData);
	};
	
	dMultiplayer.initData = function(override)
	{
		if (!dMultiplayer.getStorage().data.serverside)
			dMultiplayer.getStorage().data.serverside = false;
		if (!dMultiplayer.getStorage().data.advspycount)
			dMultiplayer.getStorage().data.advspycount = 0;
		if (!dMultiplayer.getStorage().data.sabotagecount)
			dMultiplayer.getStorage().data.sabotagecount = 0;
		if (!dMultiplayer.getStorage().data.assassintrycount)
			dMultiplayer.getStorage().data.assassintrycount = 0;
		if (!dMultiplayer.getStorage().data.sabotagedcount)
			dMultiplayer.getStorage().data.sabotagedcount = 0;
		if (!dMultiplayer.getStorage().data.platformlicencessold)
			dMultiplayer.getStorage().data.platformlicencessold = 0;
		if (!dMultiplayer.getStorage().data.arrested)
			dMultiplayer.getStorage().data.arrested = false;
		if (!dMultiplayer.getStorage().data.goingtoprison)
			dMultiplayer.getStorage().data.goingtoprison = false;
		if (!dMultiplayer.getStorage().data.mpplatforms)
			dMultiplayer.getStorage().data.mpplatforms = [];
		if (!dMultiplayer.getStorage().data.unplatforms)
			dMultiplayer.getStorage().data.unplatforms = [];
		if (!dMultiplayer.getStorage().settings.playercode)
			dMultiplayer.getStorage().settings.playercode = dMultiplayer.getRandomInteger();
		if (!dMultiplayer.getStorage().settings.mpsrvhistory)
			dMultiplayer.getStorage().settings.mpsrvhistory = [];
		
		if ($("#switchButton").hasClass("disabledButton"))
			$("#switchButton").removeClass("disabledButton").addClass("orangeButton");
		
		if (override === true || (!isConnected && !triedConnect))
		{
			$("#mainMenu").dialog("close");
			dMultiplayer.showServersWindow(triedConnect);
			triedConnect = true;
		}
	};

	dMultiplayer.initSocket = function(ip, desc)
	{
		dMultiplayer.resetSettings();
		competitors = [];
		serverSideLoaded = false;
		loopingSC = false;
		opped = false;
		coSentID = -1;
		coID = -1;
		
		if (isConnected)
		{
			dMultiplayer.setConnected(false);
			
			if (!listMinimized)
			{
				$("#gdtmpcard").height("100px");
				$("#gdtmpminimize").css("bottom", "141px");
				$("#gdtmpinfo").css("bottom", "141px");
				$("#gdtmpchat").css("bottom", "141px");
			}
			
			dMultiplayer.refresh();
			GameManager.resume(true);
			
			if (ip)
				dMultiplayer.displayMessage("Reconnecting...".dlocalize(modid), false);
			
			dMultiplayer.disconnect(true);
		}
		else if (ip)
			dMultiplayer.displayMessage("Connecting...".dlocalize(modid), false);
		
		if (!ip)
		{
			$("#gdtmpcard").html("");
			$("#gdtmpcard").hide();
			$("#gdtmpminimize").hide();
			$("#gdtmpinfo").hide();
			$("#gdtmpchat").hide();
			dMultiplayer.refresh();
			return;
		}
		else
		{
			$("#gdtmpcard").show();
			$("#gdtmpminimize").show();
			$("#gdtmpinfo").show();
			$("#gdtmpchat").show();
		}
		
		var ipPort = ip;
		var hasPort = ip.split(":").length > 1;
		if (!hasPort)
			ipPort += ":3966";
		
		socket = new WebSocket("ws://" + ipPort);

		socket.onopen = function()
		{
			dMultiplayer.setConnected(true);
			
			var modlist = "";
			modsAtLoad.forEach(function(modinarr)
			{
				if (modinarr.active)
					modlist += modinarr.id.replace(new RegExp(sep2, "g"), "").replace(new RegExp(sep3, "g"), "").replace(new RegExp(sep4, "g"), "") + sep2 + (modinarr.name + " " + modinarr.version).replace(new RegExp(sep2, "g"), "").replace(new RegExp(sep3, "g"), "").replace(new RegExp(sep4, "g"), "") + sep3;
			});
			if (modlist != "")
				modlist = modlist.substr(0, modlist.length - 1);
			
			dMultiplayer.sendStatus("REQID", dMultiplayer.getStorage().settings.playercode + sep + dmod.version + sep + modlist);
			
			setTimeout(function() { dMultiplayer.sendCompany(!loopingSC); }, 1000);
			dMultiplayer.refresh();
			
			var badmodindex = dMultiplayer.getObjectArrayIndex(modsAtLoad, "id", "CheatMod-kristof1104");
			if (badmodindex > -1 && modsAtLoad[badmodindex].active)
			{
				dMultiplayer.sendStatus("BADLOSER"); //hehe
				sentBL = true;
			}
			
			var historydesc = desc ? desc : ipPort;
			var historyitem =
			{
				ip: ipPort,
				description: historydesc
			};
			
			dMultiplayer.getStorage().settings.mpsrvhistory.forEach(function(srvinarr, i)
			{
				if (srvinarr.ip == ipPort)
					dMultiplayer.getStorage().settings.mpsrvhistory.splice(i, 1);
			});
			
			dMultiplayer.getStorage().settings.mpsrvhistory.push(historyitem);
			if (dMultiplayer.getStorage().settings.mpsrvhistory.length > 10)
				dMultiplayer.getStorage().settings.mpsrvhistory = dMultiplayer.getStorage().settings.mpsrvhistory.slice(dMultiplayer.getStorage().settings.mpsrvhistory.length - 10, dMultiplayer.getStorage().settings.mpsrvhistory.length);
			
			DataStore.saveSettings();
		};

		socket.onmessage = function(event)
		{
			var data = event.data.split(sep);
			if (data.length < 2) return;
			var id = data.pop();
			var index = dMultiplayer.getObjectArrayIndex(competitors, "id", id);
			if (id != serverID && index === undefined && data[0] != "COMPANY" && data[0] != "REQCOMP") return;
			var strippeddata = $.extend(true, [], data);
			var dataid = strippeddata.shift();
			
			customPreReceivers.forEach(function(receiverinarr)
			{
				if (receiverinarr.id == dataid)
					receiverinarr.receiver(id, strippeddata);
			});
			
			switch (dataid)
			{
				case "ACHIEVE":
					if (data.length < 3) return;
					
					var company = competitors[index].name;
					var achievementid = data[1];
					var achievementtitle = data[2];
					
					var nametodisplay = achievementtitle;
					if (Achievements[achievementid] !== undefined)
						nametodisplay = Achievements[achievementid].title;
					
					dMultiplayer.displayMessage("{0} achieved \"{1}\"".dlocalize(modid).format(company, nametodisplay), false);
					break;
				
				case "ADVSPY":
					if (data.length < 3) return;
					
					var target = data[1];
					var factor = data[2];
					
					if (target == playerID)
					{
						var design = 0;
						var tech = 0;
						var efficiency = 0;
						
						GameManager.company.staff.forEach(function(staffinarr)
						{
							design += Math.floor(staffinarr.designFactor * 500);
							tech += Math.floor(staffinarr.technologyFactor * 500);
							efficiency += Math.round(staffinarr.efficiency) * 100 / GameManager.company.staff.length;
						});
						
						efficiency = Math.round(efficiency) + "%";
						
						var research = GameManager.company.researchPoints;
						var advspycount = dMultiplayer.getStorage().data.advspycount;
						var sabotagecount = dMultiplayer.getStorage().data.sabotagecount;
						var sabotagedcount = dMultiplayer.getStorage().data.sabotagecount;
						
						var researchedtopics = "";
						GameManager.company.topics.forEach(function(topicinarr)
						{
							researchedtopics += topicinarr.name.localize() + "\n";
						});
						
						var researchedfeatures = "";
						GameManager.company.researchCompleted.forEach(function(rsinarr)
						{
							researchedfeatures += rsinarr.name + "\n";
						});
						
						var stolentype = "";
						var stolenresearch = "";
						if (GameManager.company.topics && GameManager.company.topics.length > 0 && factor / 1.5 > GameManager.company.getRandom())
						{
							stolentype = "topic";
							stolenresearch = GameManager.company.topics[Math.floor(GameManager.company.getRandom() * GameManager.company.topics.length)].id;
						}
						if (GameManager.company.researchCompleted && GameManager.company.researchCompleted.length > 0 && factor / 3.5 > GameManager.company.getRandom())
						{
							stolentype = "research";
							stolenresearch = GameManager.company.researchCompleted[Math.floor(GameManager.company.getRandom() * GameManager.company.researchCompleted.length)].id;
						}
						
						if (factor > GameManager.company.getRandom())
						{
							dMultiplayer.sendStatus("ASPYDATA", id + sep + factor + sep + design + sep + tech + sep + efficiency + sep + research + sep + advspycount + sep + sabotagecount + sep + sabotagedcount + sep + researchedtopics + sep + researchedfeatures + sep + stolentype + sep + stolenresearch);
							dMultiplayer.sendStatus("ASPIED");
						}
						else
							dMultiplayer.sendStatus("ASPYFAIL", id);
							
						var n = new Notification(
						{
							header: "Abnormal Activity".dlocalize(modid),
							text: "It seems like someone has broken into our servers and downloaded a lot of files. Police are investigating this matter...".dlocalize(modid),
							weeksUntilFired: 2 + 2 * GameManager.company.getRandom()
						});
						GameManager.company.notifications.push(n);
					}
					
					break;
					
				case "ANNCONS":
					if (data.length < 2) return;
						
					var company = competitors[index].name;
					var console = data[1];
					
					dMultiplayer.displayMessage("{0} announced the \"{1}\"".dlocalize(modid).format(company, console), false);
					break;
					
				case "ANNGAME":
					if (data.length < 4) return;
					
					var company = competitors[index].name;
					var game = data[1];
					var topic = data[2].localize();
					var genre = data[3].localize();
					
					dMultiplayer.handleAnnounceData(company, game, topic, genre);
					break;
				
				case "ASPIED":
					var company = competitors[index].name;
					dMultiplayer.displayMessage("{0} had lots of documents stolen, police are investigating...".dlocalize(modid).format(company), false);
					break;
					
				case "ASPYDATA":
					if (data.length < 14) return;
					
					var company = competitors[index].name;
					var target = data[1];
					var factor = data[2];
					var design = data[3];
					var tech = data[4];
					var efficiency = data[5];
					var research = data[6];
					var advspycount = data[7];
					var sabotagecount = data[8];
					var sabotagedcount = data[9];
					var researchedtopics = data[10] ? data[10] : "none";
					var researchedfeatures = data[11] ? data[11] : "none";
					var stolentype = data[12] ? data[12] : "none";
					var stolenresearch = data[13] ? data[13] : "none";
					
					var caught = factor * 2 < GameManager.company.getRandom();
					
					if (target == playerID)
					{
						var stolen = false;
						var stolenresearchname = "";
						
						if (stolentype != "none" && dMultiplayer.getObjectArrayIndex(GameManager.currentResearches, "id", stolenresearch) === undefined && ((stolentype == "topic" && dMultiplayer.getObjectArrayIndex(GameManager.company.topics, "id", stolenresearch) === undefined) || (stolentype == "research" && dMultiplayer.getObjectArrayIndex(GameManager.company.researchCompleted, "id", stolenresearch) === undefined)))
						{
							if (stolentype == "topic")
							{
								var topicindex = dMultiplayer.getObjectArrayIndex(Topics.topics, "id", stolenresearch);
								if (topicindex !== undefined)
								{
									GameManager.company.topics.push(Topics.topics[topicindex]);
									if (researchOpen)
									{
										GameManager.pause(true);
										GameManager.autoSave(function()
										{
											GameManager.reload("auto", undefined, undefined, true); //reload research dialog
										});
									}
									stolenresearchname = Topics.topics[topicindex].name;
									stolen = true;
								}
							}
							else if (stolentype == "research")
							{
								for (var researchelement in Research)
								{
									if (!stolen && Research[researchelement].id == stolenresearch && (Research[researchelement].pointsCost === undefined || Research[researchelement].pointsCost < 500))
									{
										GameManager.company.researchCompleted.push(Research[researchelement]);
										if (researchOpen)
										{
											GameManager.pause(true);
											GameManager.autoSave(function()
											{
												GameManager.reload("auto", undefined, undefined, true);
											});
										}
										stolenresearchname = Research[researchelement].name;
										stolen = true;
										break;
									}
								}
							}
							
							if (stolen)
								Research.checkForNewResearch();
						}
						
						var stealmessage = "";
						if (stolen)
							stealmessage = "\n\nOh, and we also managed to borrow some documents related to \"{0}\".".dlocalize(modid).format(stolenresearchname);
						
						var n = new Notification(
						{
							header: "{0} spy report".dlocalize(modid).format(company),
							text: ("Total team design: {0}\nTotal team technology: {1}\nCurrent team efficiency: {2}\nResearch points: {3}\nTimes used advanced spying: {4}\nTimes sabotaged other companies: {5}\nTimes sabotaged by other companies: {6}" +
									"\n\nTopics available:\n{7}\nResearched features:\n{8}\nWe appreciate your trust in us.\nAgent Rijndael").dlocalize(modid).format(design, tech, efficiency, research, advspycount, sabotagecount, sabotagedcount, researchedtopics, researchedfeatures) + stealmessage,
							weeksUntilFired: 1 + 2 * GameManager.company.getRandom()
						});
						GameManager.company.notifications.push(n);
						
						dMultiplayer.getStorage().data.advspycount++;
						
						if (caught)
							GameManager.company.notifications.insertAt(0, advancedSpyPoliceEvent.getNotification());
					}
					
					break;
					
				case "ASPYFAIL":
					if (data.length < 2) return;
					
					var company = competitors[index].name;
					var target = data[1];
					
					if (target == playerID)
					{
						var n = new Notification(
						{
							header: "{0} spy report".dlocalize(modid).format(company),
							text: "Sorry, we weren't able to complete the mission.\n\nApologies,\nAgent Rijndael".dlocalize(modid),
							weeksUntilFired: 1 + 2 * GameManager.company.getRandom()
						});
						GameManager.company.notifications.push(n);
					}
					break;
					
				case "CAUGHT":
					if (data.length < 3) return;
					
					var company = competitors[index].name;
					var fine = data[1];
					var reason = data[2];
					
					dMultiplayer.displayMessage("{0} was arrested and fined {1} cr. for {2}!".dlocalize(modid).format(company, UI.getShortNumberString(Math.floor(fine)), reason.dlocalize(modid)), false);
					break;
				
				case "COGANN":
					if (data.length < 5) return;
					
					var company = competitors[index].name;
					var game = data[1];
					var topic = data[2].localize();
					var genre = data[3].localize();
					var cocompanyid = data[4]; //GDTMPID is stripped off
					
					var cocompanyindex = dMultiplayer.getObjectArrayIndex(competitors, "id", cocompanyid);
					if (cocompanyindex !== undefined)
						dMultiplayer.handleAnnounceData(company + "/" + competitors[cocompanyindex].name, game, topic, genre);
					
					break;
				
				case "COGCONF":
					if (data.length < 3 || id != coID) return;
					
					var target = data[1];
					var gameid = data[2];
					
					if (!dMultiplayer.canCoDevelop() && !gameDefinitionOpen)
						dMultiplayer.sendStatus("COGFAIL", id);
					else if (target == playerID)
					{
						var topic = Topics.topics.first(function(topicinarr)
						{
							return topicinarr.id == coTopic;
						});
						var genre = GameGenre.getAll().first(function(genreinarr)
						{
							return genreinarr.id == coGenre;
						});
						var genre2 = GameGenre.getAll().first(function(genreinarr)
						{
							return genreinarr.id == coGenre2;
						});
						
						var platforms = [];
						coPlatforms.split(sep2).forEach(function(coplatinarr)
						{
							var platformtoadd = Platforms.allPlatforms.filter(function(platinarr)
							{
								return platinarr.id == coplatinarr;
							});
							
							if (platformtoadd.length > 0)
								platforms.push(platformtoadd[0]);
						});
						
						var techlevel = coFeatures.filter(function(featureinarr)
						{
							return featureinarr.techLevel !== undefined;
						}).average(function(featureinarr)
						{
							return featureinarr.techLevel;
						});
						
						if (topic && genre && platforms.length > 0)
						{
							GameManager.flags.selectGameActive = false;
							GameManager.flags.createPack = false;
							GameManager.company.createNewGame();
								
							dMultiplayer.prepareGame(GameManager.company.currentGame);
							dMultiplayer.prepareCoGame(gameid, index);
							
							GameManager.company.currentGame.title = coName;
							GameManager.company.currentGame.targetAudience = coAudience;
							GameManager.company.currentGame.gameSize = coSize;
							GameManager.company.currentGame.topic = topic;
							GameManager.company.currentGame.genre = genre;
							
							if (genre2)
								GameManager.company.currentGame.secondGenre = genre2;
							
							GameManager.company.currentGame.platforms = platforms;
							GameManager.company.currentGame.engine = coEngine;
							GameManager.company.currentGame.costs = UI._updateGameDefinitionCost();
							GameManager.company.currentGame.features = coFeatures;
							GameManager.company.currentGame.flags.techLevel = techlevel;
							GameManager.company.currentGame.flags.mmo = coMMO;
							
							VisualsManager.gameStatusBar.updateGameName();
							VisualsManager.gameStatusBar.updatePoints();
							VisualsManager.gameStatusBar.progressBar.alpha = 0;
							
							GameManager.transitionToState(State.PickWorkItems);
							
							dMultiplayer.sendPlatformDevelopmentMoney();
							dMultiplayer.sendCoGameAnnouncement(GameManager.company.currentGame);
						}
						else
						{
							coSentID = -1;
							coID = -1;
							alert("ERROR: Mod incompatibility between players");
						}
					}
					break;
				
				case "COGFAIL":
					if (data.length < 2 || (id != coID && id != coSentID)) return;
					
					var target = data[1];
					
					if (target == playerID)
					{
						coSentID = -1;
						coID = -1;
					}
					
					break;
				
				case "COGFIN":
					if (data.length < 3 || (id != coID && id != coSentID)) return;
					
					var target = data[1];
					var gameid = data[2];
					
					if (target == playerID)
					{
						if (GameManager.company.currentGame && GameManager.company.currentGame.GDTMPID == gameid)
							GameManager.company.currentGame.GDTMPCoCompanyFinished = true;
						else
						{
							var gameindex = dMultiplayer.getObjectArrayIndex(GameManager.company.gameLog, "GDTMPID", gameid, true);
							if (gameindex !== undefined)
							{
								GameManager.company.gameLog[gameindex].GDTMPCoCompanyFinished = true;
								dMultiplayer.sendCoGameScore(GameManager.company.gameLog[gameindex]);
							}
						}
					}
					break;
				
				case "COGREL":
					if (data.length < 5) return;
					
					var company = competitors[index].name;
					var game = data[1];
					var topic = data[2].localize();
					var genre = data[3].localize();
					var cocompanyid = data[4]; //GDTMPID is stripped off
					
					var cocompanyindex = dMultiplayer.getObjectArrayIndex(competitors, "id", cocompanyid);
					if (cocompanyindex !== undefined)
						dMultiplayer.handleReleaseData(company + "/" + competitors[cocompanyindex].name, game, topic, genre, index);
					
					break;
				
				case "COGREQ":
					if (data.length < 15 || coID > -1) return;
					
					var company = competitors[index].name;
					var target = data[1];
					var cocost = parseFloat(data[2]);
					var corevenue = parseFloat(data[3]);
					var name = data[4];
					var size = data[5];
					var mmo = data[6] == "true";
					var topic = data[7];
					var genre = data[8];
					var genre2 = data[9];
					var platforms = data[10];
					var audience = data[11];
					var engine = JSON.parse(data[12]);
					var features = JSON.parse(data[13]);
					var gameid = data[14];
					
					if (!dMultiplayer.canCoDevelop() && !gameDefinitionOpen)
						dMultiplayer.sendStatus("COGFAIL", id);
					else if (target == playerID)
						GameManager.company.notifications.insertAt(0, coGameEvent.getNotification(company, id, cocost, corevenue, name, size, mmo, topic, genre, genre2, platforms, audience, engine, features, gameid));
					
					break;
				
				case "COGRES":
					if (data.length < 4 || id != coSentID) return;
					
					var target = data[1];
					var result = data[2];
					var gameid = data[3];
					
					if (target == playerID)
					{
						if (result == 0 && dMultiplayer.canCoDevelop() && gameDefinitionOpen)
						{
							dMultiplayer.sendStatus("COGCONF", id + sep + gameid);
							canCloseDialog = true;
							clearCoID = false;
							dMultiplayer.prepareCoGame(gameid, index);
							UI.closeGameDefinition();
							dMultiplayer.sendCoGameAnnouncement(GameManager.company.currentGame);
						}
						else
						{
							dMultiplayer.sendStatus("COGFAIL", id);
							coSentID = -1;
						}
					}
					
					break;
					
				case "COGREV":
					if (data.length < 8) return;
					
					var company = competitors[index].name;
					var game = data[1];
					var score = data[2];
					var message = data[3];
					var reviewer = data[4];
					var lasttopscore = parseFloat(data[5]);
					var previoustopscore = parseFloat(data[6]);
					var cocompanyid = data[7]; //GDTMPID is stripped off
					
					var cocompanyindex = dMultiplayer.getObjectArrayIndex(competitors, "id", cocompanyid);
					if (cocompanyindex !== undefined)
					{
						dMultiplayer.displayReviews(game + " (" + company + "/" + competitors[cocompanyindex].name + ")", score, message.ddelocalize().localize(), reviewer.ddelocalize().localize());
						dMultiplayer.updateTopScore(lasttopscore, previoustopscore);
					}
					break;
				
				case "COGSCORE":
					if (data.length < 7 || (id != coID && id != coSentID)) return;
					
					var target = data[1];
					var review1 = parseInt(data[2]);
					var review2 = parseInt(data[3]);
					var review3 = parseInt(data[4]);
					var review4 = parseInt(data[5]);
					var gameid = data[6];
					
					var reviews = [review1, review2, review3, review4];
					
					if (target == playerID && GameManager.company.gameLog.last().GDTMPID == gameid && !GameManager.company.gameLog.last().GDTMPScoreReceived)
					{
						for (var i = 0; i < 4; i++)
						{
							GameManager.company.gameLog.last().reviews[i].score = Math.round((GameManager.company.gameLog.last().reviews[i].score + reviews[i]) / 2);
							
							if (Reviews.getGenericReviewMessage) //added in Steam Workshop beta release
								GameManager.company.gameLog.last().reviews[i].message = Reviews.getGenericReviewMessage(GameManager.company.gameLog.last(), GameManager.company.gameLog.last().reviews[i].score);
						}
						
						GameManager.company.gameLog.last().GDTMPScoreReceived = true;
					}
					break;
				
				case "COGSOLD":
					if (data.length < 5) return;
					
					var company = competitors[index].name;
					var game = data[1];
					var units = data[2];
					var revenue = data[3];
					var cocompanyid = data[4]; //GDTMPID is stripped off
					
					var cocompanyindex = dMultiplayer.getObjectArrayIndex(competitors, "id", cocompanyid);
					if (cocompanyindex !== undefined)
						dMultiplayer.displayMessage("{0}'s game \"{1}\" is now off the market ({2} units sold, {3} in revenue)".dlocalize(modid).format(company + "/" + competitors[cocompanyindex].name, game, UI.getShortNumberString(units), UI.getShortNumberString(revenue)), false);
					
					break;
				
				case "COMPANY":
					if (data.length < 15) return;
					
					var indicatorimage = "blank";
					var prevposition = -1;
					var mods;
					
					if (index !== undefined)
					{
						indicatorimage = competitors[index].indicatorimage;
						prevposition = competitors[index].prevposition;
						mods = competitors[index].mods;
					}
					else
					{
						var tempmods = modlist.filter(function(modinarr)
						{
							return modinarr.id == id;
						});
						if (tempmods.length > 0)
						{
							mods = [];
							tempmods.forEach(function(modinarr)
							{
								mods.push(modinarr);
							});
						}
					}
					
					var updatedopspecifierversion = dMultiplayer.compareVersions(settings.version, "1.5.3.0", true);
					
					var competitor =
					{
						id: id,
						name: updatedopspecifierversion ? data[1] : data[1].replace(/(^\W+)/mg, ""),
						boss: updatedopspecifierversion ? data[2] : data[2].replace(/(^\W+)/mg, ""),
						cash: parseInt(data[3]),
						fans: parseInt(data[4]),
						rp: parseInt(data[5]),
						week: parseInt(data[6]),
						employees: parseInt(data[7]),
						platformcount: parseInt(data[8]),
						gamecount: parseInt(data[9]),
						favouritegenre: data[10],
						avgcosts: parseInt(data[11]),
						avgincome: parseInt(data[12]),
						avgscore: parseFloat(data[13]),
						highscore: parseFloat(data[14]),
						muted: false,
						indicatorimage: indicatorimage,
						prevposition: prevposition,
						mods: mods
					};
					
					pushNew = true;
					dMultiplayer.overwriteObjectByID(competitors, competitor);
					
					if (pushNew)
					{
						competitors.push(competitor);
						
						if (data.length > 15 && data[15] == "join")
							dMultiplayer.displayMessage("{0} joined".dlocalize(modid).format(competitor.name), true);
						
						if (competitors.length > 5 && !listMinimized && $("#gdtmpcard").height() + 20 <= window.innerHeight - 300)
						{
							$("#gdtmpcard").height("+=20px");
							$("#gdtmpminimize").css("bottom", "+=20px");
							$("#gdtmpinfo").css("bottom", "+=20px");
							$("#gdtmpchat").css("bottom", "+=20px");
						}
						
						if (infoOpen)
							dMultiplayer.updateInfoTargets();
					}
					
					dMultiplayer.refresh();
					
					if (infoOpen)
						dMultiplayer.updateInfoArea();
					
					break;
					
				case "CONSOLE":
					if (data.length < 10 || !GameManager.company || competitors[index].name == GameManager.company.name) return;
					
					pushNew = true;
					var cid = id;
					
					var console =
					{
						id: data[1],
						iconUri: data[2],
						name: "\"" + data[3] + "\"",
						company: competitors[index].name,
						licencePrize: 1000000,
						published: data[4],
						platformRetireDate: "260/12/4",
						developmentCosts: 100000,
						genreWeightings: data[5].split(":"),
						audienceWeightings: data[6].split(":"),
						techLevel: parseFloat(data[7]),
						startAmount: parseFloat(data[8]),
						unitsSold: parseFloat(data[9]),
						isGDTMP: true,
						relNow: false,
						playerid: cid
					};
					
					if (General.getWeekFromDateString(console.published, true) > GameManager.company.currentWeek)
					{
						if (settings.syncconsoles) return;

						var date = GameManager.company.getDate(Math.ceil(GameManager.company.currentWeek) / GameManager.flags.gameLengthModifier);
						console.published = date.year + "/" + date.month + "/" + date.week;
					}
					
					dMultiplayer.overwriteObjectByID(Platforms.allPlatforms, console, "console");
					dMultiplayer.overwriteObjectByID(GameManager.company.availablePlatforms, console, "console");
					dMultiplayer.overwriteObjectByID(GameManager.company.licencedPlatforms, console, "console");
					dMultiplayer.overwriteObjectByID(dMultiplayer.getStorage().data.mpplatforms, console, "console");
					
					existsoutsideun = !pushNew;
					
					dMultiplayer.overwriteObjectByID(dMultiplayer.getStorage().data.unplatforms, console);
					
					if (pushNew)
					{
						if (data.length > 10 && data[10] == "rel")
							console.relNow = true;

						dMultiplayer.getStorage().data.unplatforms.push(console);
					}
					else if (!existsoutsideun && data.length > 10 && data[10] == "rel")
					{
						var index = dMultiplayer.getObjectArrayIndex(dMultiplayer.getStorage().data.unplatforms, "id", console.id);
						dMultiplayer.getStorage().data.unplatforms[index].relNow = true;
					}
					
					break;
					
				case "CREENG":
					if (GameManager.company.researchCompleted.indexOf(spyResearch) < 0 || data.length < 2) return;
					
					var company = competitors[index].name;
					var engine = data[1];
					
					dMultiplayer.displayMessage("{0} started working on engine \"{1}\"".dlocalize(modid).format(company, engine), false);
					break;
				
				case "DISCONN":
					if (data.length < 3 || id != serverID) return;
					
					var playerid = data[1];
					var action = data[2];
					
					var playerindex = dMultiplayer.getObjectArrayIndex(competitors, "id", playerid);
					
					if (playerindex > -1)
					{
						var displayedaction = "left".dlocalize(modid);
						if (action == "kick")
							displayedaction = "was kicked".dlocalize(modid);
						
						dMultiplayer.displayMessage(competitors[playerindex].name + " " + displayedaction, true);
						competitors.splice(playerindex, 1);
						
						if (competitors.length > 4 && !listMinimized)
						{
							$("#gdtmpcard").height("-=20px");
							$("#gdtmpminimize").css("bottom", "-=20px");
							$("#gdtmpinfo").css("bottom", "-=20px");
							$("#gdtmpchat").css("bottom", "-=20px");
						}
						
						dMultiplayer.refresh();
						
						if (infoOpen)
						{
							dMultiplayer.updateInfoArea();
							dMultiplayer.updateInfoTargets();
						}
					}
					break;

				case "ENDCONS":
					if (data.length < 4) return;
					
					var company = competitors[index].name;
					var consolename = data[1];
					var consoleid = data[2];
					var units = data[3];
					
					var aindex = dMultiplayer.getObjectArrayIndex(GameManager.company.availablePlatforms, "id", consoleid);
					var lindex = dMultiplayer.getObjectArrayIndex(GameManager.company.licencedPlatforms, "id", consoleid);

					if (aindex !== undefined)
						GameManager.company.availablePlatforms.splice(aindex, 1);
					if (lindex !== undefined)
						GameManager.company.licencedPlatforms.splice(lindex, 1);

					dMultiplayer.displayMessage("{0} took their platform \"{1}\" off the market ({2} units sold)".dlocalize(modid).format(company, consolename, UI.getShortNumberString(units)), false);
					break;
				
				case "FINENG":
					if (GameManager.company.researchCompleted.indexOf(spyResearch) < 0 || data.length < 2) return;
					
					var company = competitors[index].name;
					var engine = data[1];
					
					dMultiplayer.displayMessage("{0} finished engine \"{1}\"".dlocalize(modid).format(company, engine), false);
					break;
				
				case "KICK":
					if (id != serverID) return;
					
					if (data.length > 1)
						kickmessage = data[1];
					else
						kickmessage = "none";
					
					kicked = true;
					dMultiplayer.disconnect(false);
					
					break;
				
				case "MODLIST":
					if (data.length < 2) return;
					
					var mods = data[1];
					
					var players = mods.split(sep4);
					players.forEach(function(playerinarr)
					{
						var playermoddata = playerinarr.split(sep2);
						if (playermoddata.length == 2)
						{
							var playerid = playermoddata[0];
							var playermods = playermoddata[1].split(sep3);
							var competitorindex = dMultiplayer.getObjectArrayIndex(competitors, "id", playerid);
							
							if (playermods && competitorindex !== undefined)
							{
								competitors[competitorindex].mods = [];
								playermods.forEach(function(modinarr)
								{
									competitors[competitorindex].mods.push(modinarr);
									modlist.push(
									{
										id: playerid,
										mod: modinarr
									});
								});
							}
						}
					});
					break;
				
				case "MONEY":
					if (data.length < 4) return;
					
					var target = data[1];
					var money = data[2];
					var message = data[3];
					
					if (target == playerID)
					{
						GameManager.company.adjustCash(parseInt(money), message.dlocalize(modid));
						
						if (message == "Platform licence income".dlocalize(modid))
						{
							dMultiplayer.getStorage().data.platformlicencessold++;
							
							if (dMultiplayer.getStorage().data.platformlicencessold == 5)
								Achievements.activate(Achievements.dlicence1Achievement);
							else if (dMultiplayer.getStorage().data.platformlicencessold == 10)
								Achievements.activate(Achievements.dlicence2Achievement);
							else if (dMultiplayer.getStorage().data.platformlicencessold == 20)
								Achievements.activate(Achievements.dlicence3Achievement);
						}
					}
					
					break;
				
				case "MSG":
					if (data.length < 2 || (competitors[index] && competitors[index].muted)) return;
					
					var message = data[1];
					
					var bosstodisplay;
					if (data.length > 2 && data[2] == "true" && id != serverID)
						bosstodisplay = "<@" + competitors[index].boss + "> ";
					else
						bosstodisplay = id != serverID ? "<" + competitors[index].boss + "> " : "[" + "Server".dlocalize(modid) + "] ";
					
					dMultiplayer.displayMessage(bosstodisplay + message, true);
					break;
				
				case "OPSTATUS":
					if (data.length < 2 || id != serverID) return;
					
					var opping = data[1] == "true";
					
					opped = opping;
					break;
				
				case "PRIVMSG":
					if (data.length < 3 || (competitors[index] && competitors[index].muted)) return;
					
					var message = data[2];
					
					var bosspart1 = (data.length > 3 && data[3] == "true" ? "[@" : "[") + competitors[index].boss;
					var bosspart2 = (opped ? "@" : "") + GameManager.company.staff[0].name + "] ";
					
					if (target == playerID)
						dMultiplayer.displayMessage(bosspart1 + " -> " + bosspart2 + message, true);
					
					break;
				
				case "RELGAME":
					if (data.length < 4) return;
					
					var company = competitors[index].name;
					var game = data[1];
					var topic = data[2].localize();
					var genre = data[3].localize();
					
					dMultiplayer.handleReleaseData(company, game, topic, genre, index);
					break;
				
				case "REQCOMP":
					dMultiplayer.sendCompany(false);
					break;
				
				case "RESEARCH":
					if (GameManager.company.researchCompleted.indexOf(spyResearch) < 0 || data.length < 2) return;
					
					var company = competitors[index].name;
					var research = data[1];
					
					var researchname = research;
					for (var researchelement in Research)
					{
						if (Research[researchelement].id == research)
						{
							researchname = Research[researchelement].name;
							break;
						}
					}
					
					dMultiplayer.displayMessage("{0} researched {1}".dlocalize(modid).format(company, researchname), false);
					break;
					
				case "REVIEW":
					if (data.length < 7) return;
					
					var company = competitors[index].name;
					var game = data[1];
					var score = data[2];
					var message = data[3];
					var reviewer = data[4];
					var lasttopscore = parseFloat(data[5]);
					var previoustopscore = parseFloat(data[6]);
					
					dMultiplayer.displayReviews(game + " (" + company + ")", score, message.ddelocalize().localize(), reviewer.ddelocalize().localize());
					dMultiplayer.updateTopScore(lasttopscore, previoustopscore);
					break;
					
				case "SABODATA":
					if (data.length < 4) return;
					
					var company = competitors[index].name;
					var target = data[1];
					var type = data[2];
					var caught = data[3] == "true";
					
					if (target == playerID)
					{
						var n = new Notification(
						{
							header: "{0} sabotage report".dlocalize(modid).format(company),
							text: "We have successfully done what you told us to.\n\nThanks for making business with us,\nAgent Rijndael".dlocalize(modid),
							weeksUntilFired: 1 + 2 * GameManager.company.getRandom()
						});
						GameManager.company.notifications.push(n);
						
						dMultiplayer.getStorage().data.sabotagecount++;
						
						if (caught)
						{
							switch (type)
							{
								case "hackinterviews":
									GameManager.company.notifications.insertAt(0, hackInterviewPoliceEvent.getNotification());
									break;
								
								case "ruingame":
									GameManager.company.notifications.insertAt(0, sabotagePoliceEvent.getNotification());
									break;
								
								case "assassin":
									GameManager.company.notifications.insertAt(0, murderPoliceEvent.getNotification());
							}
						}
						else
						{
							switch (type)
							{
								case "hackinterviews":
									setTimeout(function() { Achievements.activate(Achievements.hiNotCaughtAchievement); }, 15000);
									break;
								
								case "ruingame":
									setTimeout(function() { Achievements.activate(Achievements.rgNotCaughtAchievement); }, 15000);
									break;
								
								case "assassin":
									setTimeout(function() { Achievements.activate(Achievements.assassinNotCaughtAchievement); }, 15000);
							}
						}
					}
					break;
					
				case "SABOFAIL":
					if (data.length < 2) return;
					
					var company = competitors[index].name;
					var target = data[1];
					
					if (target == playerID)
					{
						var n = new Notification(
						{
							header: "{0} sabotage report".dlocalize(modid).format(company),
							text: "Sorry, we weren't able to complete the mission.\n\nApologies,\nAgent Rijndael".dlocalize(modid),
							weeksUntilFired: 1 + 2 * GameManager.company.getRandom()
						});
						GameManager.company.notifications.push(n);
					}
					break;
				
				case "SABOTAGE":
					if (data.length < 4) return;
					
					var target = data[1];
					var factor = data[2];
					var type = data[3];
					
					var success = type == "hackinterviews" || (type == "ruingame" && GameManager.company.isCurrentlyDevelopingGame() && factor > GameManager.company.getRandom()) || (type == "assassin" && GameManager.company.staff.length > 1 && factor / 2 > GameManager.company.getRandom());
					var caught = success && ((type == "hackinterviews" || type == "ruingame") && factor < GameManager.company.getRandom()) || (type == "assassin" && factor / 1.5 < GameManager.company.getRandom());
					
					if (target == playerID)
					{
						if (success)
						{
							switch (type)
							{
								case "hackinterviews":
									var n = new Notification(
									{
										header: "Dissing the fans".dlocalize(modid),
										text: ("In a recent interview {0}, CEO of {1}, criticized their fans, saying they get way too excited for new games, and \"should just shut up for their own sake\".\n" +
												"{1} insist that {0} did not write this, or rather that \"this very insulting assertion wasn't made by anyone within the company\", but we don't know if that's simply a bad excuse or not.").dlocalize(modid).format(GameManager.company.staff[0].name, GameManager.company.name),
										weeksUntilFired: 1 + 2 * GameManager.company.getRandom()
									});
									n.adjustFans(-2500 - GameManager.company.fans / 30 * GameManager.company.getRandom());
									GameManager.company.notifications.push(n);
									
									dMultiplayer.sendStatus("SABOTAGD", "interviews hacked");
									break;
								
								case "ruingame":
									var n = new Notification(
									{
										header: "We've been hacked!".dlocalize(modid),
										text: "It seems like someone has broken into our servers and corrupted some of the files for the game in development. Police are investigating this matter...".dlocalize(modid)
									});
									GameManager.company.activeNotifications.addRange(n.split());
									
									GameManager.company.currentGame.designPoints = Math.round(GameManager.company.currentGame.designPoints * (0.7 + 0.25 * GameManager.company.getRandom()));
									GameManager.company.currentGame.technologyPoints = Math.round(GameManager.company.currentGame.technologyPoints * (0.7 + 0.25 * GameManager.company.getRandom()));
									GameManager.company.currentGame.bugs = Math.round(GameManager.company.currentGame.bugs * (1.5 + 0.5 * GameManager.company.getRandom()));
									
									VisualsManager.updatePoints();
									
									dMultiplayer.sendStatus("SABOTAGD", "project corrupted");
									break;
								
								case "assassin":
									GameManager.company.notifications.insertAt(0, assassinEvent.getNotification());
									break;
							}
							
							dMultiplayer.getStorage().data.sabotagedcount++;
							dMultiplayer.sendStatus("SABODATA", id + sep + type + sep + caught.toString());
						}
						else
						{
							var foundcustom = false;
							for (var sabotageoption in customSabotage)
							{
								if (sabotageoption == type)
								{
									customSabotage[sabotageoption].receiver(id, factor);
									foundcustom = true;
									break;
								}
							}
							
							if (!foundcustom)
								dMultiplayer.sendStatus("SABOFAIL", id);
						}
					}
					
					break;
					
				case "SABOTAGD":
					var company = competitors[index].name;
					if (data.length < 2 || GameManager.company.researchCompleted.indexOf(spyResearch) < 0 || company == GameManager.company.name) return;
					
					var type = data[1];
							
					dMultiplayer.displayMessage("{0} was sabotaged ({1}!)".dlocalize(modid).format(company, type.dlocalize(modid)), false);
					break;
					
				case "SAVEDATA":
					if (data.length < 3 || id != serverID) return;
					
					var saveinfo = data[1];
					var savedata = data[2];
					
					if (savedata[0] == "{")
					{
						var parseddata = JSON.parse(savedata);
						if (parseddata.company.uid == GameManager.company.uid && parseddata.company.slot == GameManager.company.slot)
							dMultiplayer.parseServerSideData(saveinfo, parseddata);
						else
						{
							$("#confirmServerSideLoadDialog").dialog(
							{
								draggable: false,
								modal: true,
								resizable: false,
								show: "fade",
								zIndex: 7000,
								title: "Attention".dlocalize(modid),
								open: function()
								{
									multiplayerDialogOpen = true;
									$(this).siblings(".ui-dialog-titlebar").remove();
									
									$("#confirmServerSideLoadYesButton").clickExclOnce(function()
									{
										Sound.click();
										$("#confirmServerSideLoadDialog").dialog("close");
										
										dMultiplayer.parseServerSideData(saveinfo, parseddata);
									});
									
									$("#confirmServerSideLoadNoButton").clickExclOnce(function()
									{
										Sound.click();
										$("#confirmServerSideLoadDialog").dialog("close");
										
										dMultiplayer.initSocket();
									});
								},
								close: function()
								{
									$(this).dialog("destroy");
									this.style.cssText = "display: none;";
								}
							});
						}
					}
					else
						dMultiplayer.displayMessage("ERROR: The server sent invalid save data".dlocalize(modid), true);
					
					break;
				
				case "SAVEFAIL":
					if (id != serverID) return;
					
					$("#confirmServerSideDialog").dialog(
					{
						draggable: false,
						modal: true,
						resizable: false,
						show: "fade",
						zIndex: 7000,
						title: "Attention".dlocalize(modid),
						open: function()
						{
							multiplayerDialogOpen = true;
							$(this).siblings(".ui-dialog-titlebar").remove();
							
							$("#confirmServerSideNoButton").clickExclOnce(function()
							{
								Sound.click();
								$("#confirmServerSideDialog").dialog("close");
								
								dMultiplayer.initSocket();
							});
							
							$("#confirmServerSideYesButton").clickExclOnce(function()
							{
								Sound.click();
								$("#confirmServerSideDialog").dialog("close");
								
								GameManager.resume(true, true);
								GameManager.startNewGame();
								dMultiplayer.getStorage().data.serverside = true;
							});
						},
						close: function()
						{
							$(this).dialog("destroy");
							this.style.cssText = "display: none;";
						}
					});
					break;
				
				case "SETTINGS":
					if (data.length < 2 || id != serverID) return;
					
					var version = data[1];
					
					if (!dMultiplayer.compareVersions(version, minsrvversion, true))
					{
						dMultiplayer.displayMessage("The server is outdated.".dlocalize(modid), true);
						dMultiplayer.disconnect(false);
						return;
					}
					
					if (data.length < 7) return;
					
					var timesync = data[2];
					var syncconsoles = data[3];
					var offlineconsoles = data[4];
					var reviewbattle = data[5];
					var serversidesave = data[6];
					
					var prevserversidesave = settings.serversidesave;
					
					settings.version = version;
					settings.timesync = timesync == "true";
					settings.syncconsoles = syncconsoles == "true";
					settings.offlineconsoles = offlineconsoles == "true";
					settings.reviewbattle = reviewbattle == "true";
					settings.serversidesave = serversidesave == "true";
					
					if (!prevserversidesave && !serverSideLoaded && settings.serversidesave)
						dMultiplayer.sendStatus("SAVELOAD");
					
					break;
				
				case "SOLDGAME":
					if (data.length < 4) return;
					
					var company = competitors[index].name;
					var game = data[1];
					var units = data[2];
					var revenue = data[3];
					
					dMultiplayer.displayMessage("{0}'s game \"{1}\" is now off the market ({2} units sold, {3} in revenue)".dlocalize(modid).format(company, game, UI.getShortNumberString(units), UI.getShortNumberString(revenue)), false);
					break;
					
				case "TRADEREQ":
					if (data.length < 5) return;
					
					var company = competitors[index].name;
					var target = data[1];
					var type = data[2];
					var rp = data[3];
					var money = data[4];
					
					if (target == playerID && ((type == "reqrp" && rp <= GameManager.company.researchPoints) || (type == "reqcash" && money <= GameManager.company.cash)))
						GameManager.company.notifications.insertAt(0, tradeEvent.getNotification(company, id, type, rp, money));
					
					break;
					
				case "TRADERES":
					if (data.length < 6) return;
					
					var company = competitors[index].name;
					var target = data[1];
					var result = data[2];
					var type = data[3];
					var rp = data[4];
					var money = data[5];
					
					if (target == playerID)
					{
						var n;
						if (result == 0)
						{
							n = new Notification(
							{
								header: "{0} trade".dlocalize(modid).format(company),
								text: "{0} accepted the offer.\n({1} research points <-> {2} cr.)".dlocalize(modid).format(company, rp, UI.getShortNumberString(money))
							});
							
							if (type == "reqrp")
							{
								GameManager.company.researchPoints += parseInt(rp);
								GameManager.company.adjustCash(-parseInt(money), "Trade");
							}
							else if (type == "reqcash")
							{
								GameManager.company.researchPoints -= parseInt(rp);
								GameManager.company.adjustCash(parseInt(money), "Trade");
							}
							VisualsManager.updatePoints();
						}
						else if (result == 1)
						{
							n = new Notification(
							{
								header: "{0} trade".dlocalize(modid).format(company),
								text: "{0} declined the offer.".dlocalize(modid).format(company)
							});
						}
						GameManager.company.activeNotifications.addRange(n.split());
					}
					break;
				
				case "YOURID":
					if (data.length < 3 || id != serverID) return;
					
					var code = data[1];
					var yourid = data[2];
					if (code != dMultiplayer.getStorage().settings.playercode) return;
					
					playerID = parseInt(yourid);
					break;
				
				default:
					if (customReceivers[dataid])
						customReceivers[dataid](id, strippeddata);
			}
			
			customPostReceivers.forEach(function(receiverinarr)
			{
				if (receiverinarr.id == dataid)
					receiverinarr.receiver(id, strippeddata);
			});
		};

		socket.onclose = function()
		{
			if (cancelOnClose)
			{
				cancelOnClose = false;
				return;
			}
			
			if (!kicked)
				isConnected ? dMultiplayer.displayMessage("Lost connection to server, continuing in offline mode.".dlocalize(modid), true) : dMultiplayer.displayMessage("Couldn't connect to server, playing in offline mode.".dlocalize(modid), true);
			else if (kickmessage != "none")
				dMultiplayer.displayMessage("You have been kicked from the server. Message: {0}".dlocalize(modid).format(kickmessage), true);
			else
				dMultiplayer.displayMessage("You have been kicked from the server, continuing in offline mode.".dlocalize(modid), true);
			
			kicked = false;
			dMultiplayer.setConnected(false);
			dMultiplayer.initSocket();
			
			if (multiplayerDialogOpen)
				UI.closeModal();
			
			closing = false;
		};
	};
	
	dMultiplayer.playOffline = function()
	{
		dMultiplayer.initSocket();
		UI.closeModal();
	};
	
	dMultiplayer.sendStatus = function(type, str)
	{
		if (!isConnected) return;
		
		var data = type.toUpperCase();
		if (str || str === 0)
			data += sep + str;
		
		try
		{
			socket.send(data);
		}
		catch (ex)
		{
			dMultiplayer.displayMessage("ERROR: Failed to send some data.".dlocalize(modid), true);
		}
	};
	
	dMultiplayer.displayMessage = function(str, ismessage)
	{
		dMultiplayer.log(str, ismessage);
		if (chatOpen || !GameManager.company || (!ismessage && chatOnlyMsgs)) return;
		
		var additionalmessage = UI.isModalContentOpen() && activeMessages > 5;
		
		var container = new createjs.Container();
		var text;
		
		if (additionalmessage)
		{
			if (activeAdditionalMessage) return;
			
			activeAdditionalMessage = true;
			text = new createjs.Text("Additional messages visible in the chat log.".dlocalize(modid), "18pt Arial", "black");
		}
		else
			text = new createjs.Text(str, "18pt Arial", "black");
			
		text.textBaseline = "top";
		
		var width = text.getMeasuredWidth() + 8;
		var height = text.getMeasuredLineHeight() + 8;
		
		container.x = 70 - (width / 2) + 150 * GameManager.company.getRandom() * (window.innerWidth / 1024);
		container.y = window.innerHeight;
		
		var rect = new createjs.Shape();
		var graphics = rect.graphics;
		
		graphics.beginFill(createjs.Graphics.getRGB(255, 255, 255, 0.8));
		graphics.beginStroke("black");
		graphics.setStrokeStyle(1);
		graphics.drawRoundRect(-4, -4, width, height, 5);
		graphics.closePath();
		
		container.addChild(rect);
		container.addChild(text);
		container.alpha = 0;
		
		VisualsManager.gameStatusBar.addChild(container);
		
		setTimeout(function()
		{
			activeMessages++;
			createjs.Tween.get(container).to(
			{
				alpha: 1,
				y: container.y - 30 - 60 * GameManager.company.getRandom()
			}, 1000).to(
			{
				y: container.y - 85 - 50 * GameManager.company.getRandom()
			}, 5000).to(
			{
				y: container.y - 110 - 75 * GameManager.company.getRandom()
			}, 1000).to(
			{
				alpha: 0,
				y: container.y - 200 - 40 * GameManager.company.getRandom()
			}, 500).call(function()
			{
				activeMessages--;
				if (additionalmessage)
					activeAdditionalMessage = false;
				
				VisualsManager.gameStatusBar.removeChild(container);
			});
		}, (activeMessages - 1) * (activeMessages - 1) * 40);
	};
	
	dMultiplayer.displayReviews = function(game, score, message, reviewer)
	{
		dMultiplayer.log("{0} got an average score of {1}".dlocalize(modid).format(game, score), false);
		if (chatOpen || !GameManager.company) return;
		
		var container = new createjs.Container();
		
		var text = new createjs.Text(game, "16pt Arial", "black");
		var text2 = new createjs.Text(score, "22pt Arial", "black");
		var text3 = new createjs.Text("\"" + message + "\"", "12pt Arial");
		var text4 = new createjs.Text("... " + reviewer, "12pt Arial");
		
		var width = Math.max(text.getMeasuredWidth(), text2.getMeasuredWidth(), text3.getMeasuredWidth() + 8, text4.getMeasuredWidth() + 48) + 16;
		var height = text.getMeasuredLineHeight() + text2.getMeasuredLineHeight() + text3.getMeasuredLineHeight() * 2 + 38;
		
		text.textBaseline = "top";
		text2.textBaseline = "top";
		text3.textBaseline = "top";
		text4.textBaseline = "top";
		
		text.textAlign = "center";
		text2.textAlign = "center";
		
		text.x = width / 2 - 4;
		text2.x = width / 2 - 4;
		text3.x = 8;
		text4.x = 48;
		
		text2.y = text.getMeasuredLineHeight() + 10;
		text3.y = text.getMeasuredLineHeight() + text2.getMeasuredLineHeight() + 24;
		text4.y = text.getMeasuredLineHeight() + text2.getMeasuredLineHeight() + text3.getMeasuredLineHeight() + 30;
		
		container.x = (width / 2) + 150 * GameManager.company.getRandom() * (window.innerWidth / 1024);
		container.y = window.innerHeight;
		
		var rect = new createjs.Shape();
		var graphics = rect.graphics;
		
		graphics.beginFill(createjs.Graphics.getRGB(255, 255, 255, 0.8));
		graphics.beginStroke("black");
		graphics.setStrokeStyle(1);
		graphics.drawRoundRect(-4, -4, width, height, 5);
		graphics.closePath();
		
		container.addChild(rect);
		container.addChild(text);
		container.addChild(text2);
		container.addChild(text3);
		container.addChild(text4);
		container.alpha = 0;
		
		VisualsManager.gameStatusBar.addChild(container);
		
		setTimeout(function()
		{
			if (!GameManager.company) return;
			activeReviews++;
			createjs.Tween.get(container).to(
			{
				alpha: 1,
				y: container.y - 80 - 60 * GameManager.company.getRandom()
			}, 1000).to(
			{
				y: container.y - 135 - 50 * GameManager.company.getRandom()
			}, 5000).to(
			{
				y: container.y - 160 - 75 * GameManager.company.getRandom()
			}, 1000).to(
			{
				alpha: 0,
				y: container.y - 250 - 40 * GameManager.company.getRandom()
			}, 500).call(function()
			{
				VisualsManager.gameStatusBar.removeChild(container);
				activeReviews--;
			});
		}, activeReviews * activeReviews * 40);
	};
	
	dMultiplayer.refresh = function()
	{
		if (!GameManager.company) return;
		
		var totalweek = 0;
		competitors.forEach(function(compinarr)
		{
			totalweek += compinarr.week;
		});
		
		if (settings.timesync && competitors.length > 0 && GameManager.company.currentWeek && totalweek)
		{
			var divider = GameManager.company.currentWeek > 12 ? 12 : GameManager.company.currentWeek + 1;
			var curcalweek = Math.sqrt(GameManager.company.currentWeek / 20);
			var maxvalue = curcalweek > 0 ? curcalweek : 1;
			
			var minvalue = divider == 12 ? curcalweek / 10 : 1;
			if (minvalue < 0.5 || (divider == 12 && minvalue > 0))
				minvalue = 0.5;
			
			var finaldivide = Math.floor(GameManager.company.currentWeek / divider) / 1.25;
			if (finaldivide < 1)
				finaldivide = 1;
			
			var timemodifier = totalweek / divider / competitors.length / finaldivide;
			if (timemodifier > maxvalue)
				timemodifier = maxvalue;
			else if (timemodifier < minvalue)
				timemodifier = minvalue;
			else if (!timemodifier)
				timemodifier = 1;
			
			!GameManager.isGamePaused() ? GameManager._timeModifier = timemodifier : GameManager._oldTimeModifier = timemodifier;
		}
		else
			!GameManager.isGamePaused() ? GameManager._timeModifier = 1 : GameManager._oldTimeModifier = 1;
		
		$("#gdtmpcard").html("");
		
		competitors.sort(function(compinarra, compinarrb)
		{
			if (compinarra.cash != compinarrb.cash)
				return compinarrb.cash - compinarra.cash;
			else if (compinarra.fans != compinarrb.fans)
				return compinarrb.fans - compinarra.fans;
			else 
				return compinarrb.rp - compinarra.rp;
		}).forEach(function(compinarr, i)
		{
			var image = "blank";
			if (compinarr.prevposition > -1 || compinarr.indicatorimage != "blank")
			{
				if (i < compinarr.prevposition)
					image = "up";
				else if (i > compinarr.prevposition)
					image = "down";
				
				if (compinarr.indicatorimage != image)
				{
					setTimeout(function(indicatorimage)
					{
						if (compinarr.indicatorimage == indicatorimage)
							compinarr.indicatorimage = "blank";
					}(image), 5000);
				}
				
				compinarr.indicatorimage = image;
			}
			
			$("#gdtmpcard").append("<img src=\"./mods/dmultiplayer/img/" + image + ".png\" style=\"width: auto; height: auto;\" /> " + compinarr.name + " <sup>("  + compinarr.boss + ")</sup> <span style=\"float: right\">" + "Cash:".dlocalize(modid) + " " + UI.getShortNumberString(compinarr.cash) + "&nbsp;&nbsp;&nbsp;" + "Fans:".dlocalize(modid) + " " + UI.getShortNumberString(compinarr.fans) + "</span><br />");
			compinarr.prevposition = i;
		});
		
		if ($("#gdtmpcard").html() === "")
			$("#gdtmpcard").html("You are the only connected player.".dlocalize(modid));
		
		GameManager.company.licencedPlatforms = GameManager.company.licencedPlatforms.map(function(consinarr)
		{
			return PlatformsSerializer.load(consinarr);
		});
		GameManager.company.availablePlatforms = GameManager.company.availablePlatforms.map(function(consinarr)
		{
			return PlatformsSerializer.load(consinarr);
		});
		
		dMultiplayer.getStorage().data.mpplatforms.forEach(function(consinarr)
		{
			if (settings.offlineconsoles || (!settings.offlineconsoles && dMultiplayer.getObjectArrayIndex(competitors, "id", consinarr.playerid) !== undefined))
			{
				var index = dMultiplayer.getObjectArrayIndex(dMultiplayer.getStorage().data.mpplatforms, "id", consinarr.id);
				
				if (dMultiplayer.getObjectArrayIndex(GameManager.company.licencedPlatforms, "id", consinarr.id) === undefined && dMultiplayer.getObjectArrayIndex(GameManager.company.availablePlatforms, "id", consinarr.id) === undefined)
					dMultiplayer.getStorage().data.mpplatforms[index].licenced ? GameManager.company.licencedPlatforms.push(dMultiplayer.getStorage().data.mpplatforms[index]) : GameManager.company.availablePlatforms.push(dMultiplayer.getStorage().data.mpplatforms[index]);
			}
		});
		
		dMultiplayer.fixEmptyDuplicateArrayElements(GameManager.company.licencedPlatforms);
		dMultiplayer.fixEmptyDuplicateArrayElements(GameManager.company.availablePlatforms);
	};
	
	dMultiplayer.showChatWindow = function()
	{
		if (UI.isModalContentOpen() || GameManager.isGamePaused()) return;
		
		UI.showModalContent("#chatDialog",
		{
			disableCheckForNotifications: true,
			close: true,
			onOpen: function()
			{
				chatOpen = true;
				$("#chatOnlyMsgs").attr("checked", chatOnlyMsgs);
				dMultiplayer.updateChatLog();
				$("#chatArea").scrollTop($("#chatArea")[0].scrollHeight);
			},
			onClose: function()
			{
				GameManager.resume(true);
				chatOpen = false;
			}
		});
	};
	
	dMultiplayer.updateChatLog = function()
	{
		if (chatOpen)
			chatOnlyMsgs = $("#chatOnlyMsgs").attr("checked");
		
		!chatOnlyMsgs ? $("#chatArea").html(statusLog) : $("#chatArea").html(messageLog);
	};
	
	dMultiplayer.showServersWindow = function(closebutton)
	{
		UI.showModalContent("#serverBrowserDialog",
		{
			disableCheckForNotifications: true,
			close: closebutton,
			onOpen: function()
			{
				GameManager.pause(true);
				setTimeout(function() { GameManager.pause(true); }, 500); //in case it didn't pause
				
				if (oldServerArea)
				{
					$("#browserListArea").html(oldServerArea);
					oldServerArea = undefined;
				}
				
				$("#browserList").empty();
				$("#browserList").append("<tr style=\"background: #FFB437;\"><td style=\"width: 270px;\"><b>" + "Description".dlocalize(modid) + "</b></td><td style=\"width: 60px;\"><b>" + "Players".dlocalize(modid) + "</b></td><td style=\"width: 80px;\"><b>" + "Cheating".dlocalize(modid) + "</b></td><td style=\"width: 130px;\"><b>" + "IP Address".dlocalize(modid) + "</b></td></tr>");
				
				$.get("http://data.gdtmp.tk/bsrvs", function(content)
				{
					var srvs = content.split(",");
					if (srvs.length > 0 && srvs[0])
						for (var i = 0; i < srvs.length; i++)
							dMultiplayer.pollServer(srvs[i], i);
				}).fail(function()
				{
					oldServerArea = $("#browserListArea").html();
					$("#browserListArea").empty();
					$("#browserListArea").append("<div class=\"centeredButtonWrapper\">" + "Couldn't retrieve server list!".dlocalize(modid) + "</div>");
				});
				
				if (dMultiplayer.getStorage().settings.mpsrvhistory.length > 0)
				{
					dMultiplayer.getStorage().settings.mpsrvhistory.concat().reverse().forEach(function(srvinarr)
					{
						$("#browserServerHistory").append("<option value=\"" + srvinarr.ip + "\">" + srvinarr.description + "</option>");
					});
				}
				else
					$("#browserServerHistory option:selected").text("None".dlocalize(modid));
			},
			onClose: function()
			{
				GameManager.resume(true);
			}
		});
	};
	
	dMultiplayer.showTradeWindow = function()
	{
		if (UI.isModalContentOpen()) return;
		
		UI.showModalContent("#tradeDialog",
		{
			disableCheckForNotifications: true,
			close: true,
			onOpen: function()
			{
				multiplayerDialogOpen = true;
				
				var tmin = 0;
				tmax = GameManager.company.researchPoints;
				
				var tmin2 = 0;
				tmax2 = GameManager.company.cash > 0 ? GameManager.company.cash : 0;
				
				isTargetSelected = false;
				RPToPay = 0;
				moneyToPay = 0;
				
				dMultiplayer.tradeSliders(tmin, tmin2);
				
				$("#tradeTargets").empty();
				competitors.forEach(function(compinarr)
				{
					if (compinarr.cash > -1)
					{
						var listitem = $("<div class=\"selectableGameFeatureItem\">" + compinarr.name + "</div>");
						listitem.val(compinarr.id);
						listitem.clickExcl(function()
						{
							if (!listitem.hasClass("selectedFeature"))
							{
								$("#tradeTargets").find(".selectedFeature").removeClass("selectedFeature");
								listitem.addClass("selectedFeature");
								isTargetSelected = true;
									
								dMultiplayer.tradeSliders(tmin, tmin2);
								
								$("#tradeNextButton").removeClass("disabledButton").addClass("orangeButton").removeClass("baseButton").addClass("selectorButton");
							}
							else
							{
								if ($("#tradeNextButton").hasClass("orangeButton"))
									$("#tradeNextButton").removeClass("orangeButton").addClass("disabledButton").addClass("baseButton").removeClass("selectorButton");
								
								listitem.removeClass("selectedFeature");
								isTargetSelected = false;
							}
						});
						$("#tradeTargets").append(listitem);
					}
				});
				
				$("#tradeType").empty();
				var options = ["Request Research Points".dlocalize(modid), "Request Cash".dlocalize(modid)];
				options.forEach(function(option, i)
				{
					var extraclass = i === 0 ? " selectedFeature" : "";
					
					var listitem = $("<div class=\"selectableGameFeatureItem" + extraclass + "\">" + option + "</div>");
					listitem.val(i);
					listitem.clickExcl(function()
					{
						var index = $("#tradeTargets").find(".selectedFeature").val();
						if (!listitem.hasClass("selectedFeature") && (!(listitem.val() == 1 && GameManager.company.cash < 0)))
						{
							Sound.click();
						
							$("#tradeType").find(".selectedFeature").removeClass("selectedFeature");
							listitem.addClass("selectedFeature");
							
							dMultiplayer.tradeSliders(tmin, tmin2);
							
							if (isTargetSelected && $("#tradeNextButton").hasClass("disabledButton"))
								$("#tradeNextButton").removeClass("disabledButton").addClass("orangeButton").removeClass("baseButton").addClass("selectorButton");
						}
						else return;
					});
					$("#tradeType").append(listitem);
				});
			},
			onClose: function()
			{
				GameManager.resume(true);
			}
		});
	};
	
	dMultiplayer.showInfoWindow = function()
	{
		if (UI.isModalContentOpen()) return;
		
		UI.showModalContent("#infoDialog",
		{
			disableCheckForNotifications: true,
			close: true,
			onOpen: function()
			{
				multiplayerDialogOpen = true;
				infoOpen = true;
				isTargetSelected = false;
				
				dMultiplayer.updateInfoTargets();
			},
			onClose: function()
			{
				infoOpen = false;
				
				if (UI.isMenuOpen())
					UI.closeContextMenu();
				
				GameManager.resume(true);
			}
		});
	};
	
	dMultiplayer.addInfoTarget = function(name, id, prevchoice)
	{
		var listitem = $("<div class=\"selectableGameFeatureItem\">" + name + "</div>");
		listitem.val(id);
		listitem.clickExcl(function()
		{
			dMultiplayer.selectInfoTarget(listitem);
		});
		$("#infoTargets").append(listitem);
		
		if (prevchoice == id)
			dMultiplayer.selectInfoTarget(listitem);
	};
	
	dMultiplayer.selectInfoTarget = function(listitem)
	{
		if (!listitem.hasClass("selectedFeature"))
		{
			$("#infoTargets").find(".selectedFeature").removeClass("selectedFeature");
			listitem.addClass("selectedFeature");
			isTargetSelected = true;
			$("#infoNextButton").removeClass("disabledButton").addClass("orangeButton").removeClass("baseButton").addClass("selectorButton");
		}
		else
		{
			if ($("#infoNextButton").hasClass("orangeButton"))
				$("#infoNextButton").removeClass("orangeButton").addClass("disabledButton").addClass("baseButton").removeClass("selectorButton");
			
			listitem.removeClass("selectedFeature");
			isTargetSelected = false;
		}
	};
	
	dMultiplayer.updateInfoTargets = function()
	{
		var prevchoice = $("#infoTargets").find(".selectedFeature").val();
		
		$("#infoTargets").empty();
		dMultiplayer.addInfoTarget("Overall Stats".dlocalize(modid), -1);
		competitors.forEach(function(compinarr)
		{
			dMultiplayer.addInfoTarget(compinarr.name, compinarr.id, prevchoice);
		});
		
		if ($("#infoTargets").find(".selectedFeature").val() === undefined && $("#infoNextButton").hasClass("orangeButton"))
			$("#infoNextButton").removeClass("orangeButton").addClass("disabledButton").addClass("baseButton").removeClass("selectorButton");
	};
	
	dMultiplayer.updateInfoArea = function()
	{
		var company;
		var companyid = parseInt($("#infoTargets").find(".selectedFeature").val());
		var gamestats = dMultiplayer.getGameStats();
		
		if (companyid > -1)
		{
			var companyindex = dMultiplayer.getObjectArrayIndex(competitors, "id", companyid);
			if (companyindex !== undefined)
			{
				company = competitors[companyindex];
				$("#infoTitle2").html(company.name);
			}
			else
			{
				dMultiplayer.backInfoDialog(true);
				return;
			}
		}
		else
		{
			company = {};
			var genresused = {};
			
			company.cash = GameManager.company.cash / (competitors.length + 1);
			company.fans = GameManager.company.fans / (competitors.length + 1);
			company.rp = GameManager.company.researchPoints / (competitors.length + 1);
			company.week = GameManager.company.currentWeek / (competitors.length + 1);
			company.employees = GameManager.company.staff.length / (competitors.length + 1);
			company.platformcount = gamestats.platformcount / (competitors.length + 1);
			company.gamecount = GameManager.company.gameLog.length / (competitors.length + 1);
			company.avgcosts = gamestats.avgcosts / (competitors.length + 1);
			company.avgincome = gamestats.avgincome / (competitors.length + 1);
			company.avgscore = gamestats.avgscore / (competitors.length + 1);
			
			genresused[gamestats.favouritegenre] = 1;
			competitors.forEach(function(compinarr)
			{
				for (var field in compinarr)
					if (typeof compinarr[field] === "number")
						company[field] += compinarr[field] / (competitors.length + 1);
				
				genresused[compinarr.favouritegenre] > 0 ? genresused[compinarr.favouritegenre]++ : genresused[compinarr.favouritegenre] = 1;
			});
			company.favouritegenre = dMultiplayer.getFavouriteGenre(genresused);
			company.avgscore = Math.round(company.avgscore * 100) / 100;
			
			$("#infoTitle2").html("Overall Stats".dlocalize(modid));
		}
		
		var companydate = GameManager.company.getDate(company.week);
		var boss = companyid > -1 ? "Company boss:".dlocalize(modid) + " <span style=\"float: right\">" + company.boss + "</span><br />" : "";
		var avg = companyid > -1 ? "" : "Avg.".dlocalize(modid) + " ";
		var favouritegenretext = companyid > -1 ? "Favourite genre:".dlocalize(modid) : "Most used genre:".dlocalize(modid);
		companyid > -1 ? $("#infoNextButton2").show() : $("#infoNextButton2").hide();
		
		var cashpercent = Math.round(company.cash / GameManager.company.cash * 10000) / 100;
		var fanspercent = Math.round(company.fans / GameManager.company.fans * 10000) / 100;
		var rppercent = Math.round(company.rp / GameManager.company.researchPoints * 10000) / 100;
		var avgcostspercent = Math.round(company.avgcosts / gamestats.avgcosts * 10000) / 100;
		var avgincomepercent = Math.round(company.avgincome / gamestats.avgincome * 10000) / 100;
		var avgrevenuepercent = Math.round((company.avgincome - company.avgcosts) / (gamestats.avgincome - gamestats.avgcosts) * 10000) / 100;
		
		$("#infoArea").html("<div class=\"centeredButtonWrapper\" style=\"margin-top: 20px\"><h2>" + "Company Information".dlocalize(modid) + "</h2><br /></div>" +
							boss +
							avg + dMultiplayer.decapitalize("Cash:".dlocalize(modid), companyid < 0) + " <span style=\"float: right\">" + UI.getShortNumberString(company.cash) + (cashpercent != NaN && cashpercent != Infinity ? " (" + cashpercent + "%)" : "") + "</span><br />" +
							avg + dMultiplayer.decapitalize("Fans:".dlocalize(modid), companyid < 0) + " <span style=\"float: right\">" + UI.getShortNumberString(company.fans) + (fanspercent != NaN && fanspercent != Infinity ? " (" + fanspercent + "%)" : "") + "</span><br />" +
							avg + dMultiplayer.decapitalize("Research points:".dlocalize(modid), companyid < 0) + " <span style=\"float: right\">" + Math.round(company.rp) + (rppercent != NaN && rppercent != Infinity ? " (" + rppercent + "%)" : "") + "</span><br />" +
							avg + dMultiplayer.decapitalize("Current week:".dlocalize(modid), companyid < 0) + " <span style=\"float: right\">" + "Y{0} M{1} W{2}".localize().format(companydate.year, companydate.month, companydate.week) + "</span><br />" +
							avg + dMultiplayer.decapitalize("Employees:".dlocalize(modid), companyid < 0) + " <span style=\"float: right\">" + Math.round(company.employees) + " (" + Math.round(company.employees - GameManager.company.staff.length) + ")</span><br />" +
							avg + dMultiplayer.decapitalize("Platforms released:".dlocalize(modid), companyid < 0) + " <span style=\"float: right\">" + Math.round(company.platformcount) + " (" + dMultiplayer.plusPositive(Math.round(company.platformcount - gamestats.platformcount)) + ")</span><br />" +
							"<div class=\"centeredButtonWrapper\" style=\"margin-top: 20px\"><h2>" + "Game Statistics".dlocalize(modid) + "</h2></div><br />" +
							avg + dMultiplayer.decapitalize("Games released:".dlocalize(modid), companyid < 0) + " <span style=\"float: right\">" + Math.round(company.gamecount) + " (" + dMultiplayer.plusPositive(Math.round(company.gamecount - GameManager.company.gameLog.length)) + ")</span><br />" +
							favouritegenretext + " <span style=\"float: right\">" + company.favouritegenre.localize() + "</span><br />" +
							"Avg. game costs:".dlocalize(modid) + " <span style=\"float: right\">" + UI.getShortNumberString(company.avgcosts) + (avgcostspercent != NaN && avgcostspercent != Infinity ? " (" + avgcostspercent + "%)" : "") + "</span><br />" +
							"Avg. game income:".dlocalize(modid) + " <span style=\"float: right\">" + UI.getShortNumberString(company.avgincome) + (avgincomepercent != NaN && avgincomepercent != Infinity ? " (" + avgincomepercent + "%)" : "") + "</span><br />" +
							"Avg. game profit:".dlocalize(modid) + " <span style=\"float: right\">" + UI.getShortNumberString(company.avgincome - company.avgcosts) + (avgrevenuepercent != NaN && avgrevenuepercent != Infinity ? " (" + avgrevenuepercent + "%)" : "") + "</span><br />" +
							"Avg. review score:".dlocalize(modid) + " <span style=\"float: right\">" + (Math.round(company.avgscore * 100) / 100) + " (" + dMultiplayer.plusPositive(Math.round((company.avgscore - gamestats.avgscore) * 100) / 100) + ")</span>");
			
		var mods = "No mods are currently enabled. Not even GDTMP! It's a wonder this player is currently playing online...".dlocalize(modid);
		if (company.mods)
		{
			mods = "<ul>";
			company.mods.forEach(function(modinarr)
			{
				mods += "<li>" + modinarr + "</li>";
			});
			mods += "</ul>";
		}
				
		$("#infoArea2").html("<div class=\"centeredButtonWrapper\" style=\"margin-top: 20px\"><h2>" + "Mods".dlocalize(modid) + "</h2><br /></div>" + mods + "");
	};
	
	dMultiplayer.backInfoDialog = function(reset)
	{
		if ($("#infoInsideDialogScreen1").css("margin-left") == "0px" || reset)
		{
			$("#infoDialog").find(".dialogScreen1").transition(
			{
				"margin-left": "0"
			});
			$("#infoDialog").find(".dialogScreen2").transition(
			{
				"margin-left": "100%"
			});
		}
		if ($("#infoInsideDialogScreen1").css("margin-left") != "0px" || reset)
		{
			$("#infoInsideDialogScreen1").transition(
			{
				"margin-left": "0"
			});
			$("#infoInsideDialogScreen2").transition(
			{
				"margin-left": "100%"
			});
		}
	};
	
	dMultiplayer.showAdvSpyWindow = function()
	{
		if (UI.isModalContentOpen()) return;
		
		UI.showModalContent("#advSpyDialog",
		{
			disableCheckForNotifications: true,
			close: true,
			onOpen: function()
			{
				multiplayerDialogOpen = true;
				
				var bmin = 500;
				var bmax = 2500;
				
				isTargetSelected = false;
				budgetFactor = (bmin / bmax) - 0.05;
				moneyToPay = bmin * 1000;
				
				if (moneyToPay > GameManager.company.cash)
				{
					$("#advSpyCost").css("color", "red");
					$("#advSpyButton").removeClass("orangeButton").addClass("disabledButton");
				}
				
				$("#advSpyBudgetSlider").empty();
				$("#advSpyBudgetSlider").append($("<div class=\"budgetSlider\"></div>").slider(
				{
					orientation: "horizontal",
					range: "min",
					min: bmin,
					max: bmax,
					value: bmin,
					animate: "fast",
					slide: function(event, ui)
					{
						if (ui)
						{
							budgetFactor = (ui.value / bmax) - 0.05;
							moneyToPay = ui.value * 1000;
							$("#advSpyBudgetSlider").slider("value", ui.value);
							$("#advSpyCost").html("Cost:".dlocalize(modid) + " " + UI.getShortNumberString(moneyToPay));
							
							if (GameManager.company.cash > moneyToPay)
							{
								$("#advSpyCost").css("color", "black");
								
								if (isTargetSelected && $("#advSpyButton").hasClass("disabledButton"))
									$("#advSpyButton").removeClass("disabledButton").addClass("orangeButton");
							}
							else
							{
								$("#advSpyCost").css("color", "red");
								
								if ($("#advSpyButton").hasClass("orangeButton"))
									$("#advSpyButton").removeClass("orangeButton").addClass("disabledButton");
							}
						}
					}
				}));
					
				$("#advSpyTargets").empty();
				competitors.forEach(function(compinarr)
				{
					var listitem = $("<div class=\"selectableGameFeatureItem\">" + compinarr.name + "</div>");
					listitem.val(compinarr.id);
					listitem.clickExcl(function()
					{
						Sound.click();
						
						if (!listitem.hasClass("selectedFeature"))
						{
							$("#advSpyTargets").find(".selectedFeature").removeClass("selectedFeature");
							listitem.addClass("selectedFeature");
							
							if (GameManager.company.cash > moneyToPay)
								$("#advSpyButton").removeClass("disabledButton").addClass("orangeButton");
						}
						else
						{
							if ($("#advSpyButton").hasClass("orangeButton"))
								$("#advSpyButton").removeClass("orangeButton").addClass("disabledButton");
							
							listitem.removeClass("selectedFeature");
						}
					});
					$("#advSpyTargets").append(listitem);
				});
			},
			onClose: function()
			{
				GameManager.resume(true);
			}
		});
	};
	
	//this part is so stupid
	dMultiplayer.showSabotageWindow = function()
	{
		if (UI.isModalContentOpen()) return;
		
		UI.showModalContent("#sabotageDialog",
		{
			disableCheckForNotifications: true,
			close: true,
			onOpen: function()
			{
				multiplayerDialogOpen = true;
				
				var bmin = 2000;
				var bmax = 10000;
				
				isTargetSelected = false;
				budgetFactor = (bmin / bmax) - 0.05;
				sliderMoneyToPay = bmin * 1000;
				moneyToPay = sliderMoneyToPay;
				
				if (moneyToPay > GameManager.company.cash)
				{
					$("#sabotageCost").css("color", "red");
					$("#sabotageButton").removeClass("orangeButton").addClass("disabledButton");
				}
					
				$("#sabotageTargets").empty();
				i = 0;
				competitors.forEach(function(compinarr)
				{
					var listitem = $("<div class=\"selectableGameFeatureItem\">" + compinarr.name + "</div>");
					listitem.val(compinarr.id);
					listitem.clickExcl(function()
					{
						Sound.click();
						
						if (!listitem.hasClass("selectedFeature"))
						{
							$("#sabotageTargets").find(".selectedFeature").removeClass("selectedFeature");
							listitem.addClass("selectedFeature");
							isTargetSelected = true;
							
							if (GameManager.company.cash > moneyToPay && $("#sabotageButton").hasClass("disabledButton"))
								$("#sabotageButton").removeClass("disabledButton").addClass("orangeButton");
						}
						else
						{
							if ($("#sabotageButton").hasClass("orangeButton"))
								$("#sabotageButton").removeClass("orangeButton").addClass("disabledButton");
							
							listitem.removeClass("selectedFeature");
							isTargetSelected = false;
						}
					});
					$("#sabotageTargets").append(listitem);
				});
				
				$("#sabotageBudgetSlider").empty();
				$("#sabotageBudgetSlider").append($("<div class=\"budgetSlider\"></div>").slider(
				{
					orientation: "horizontal",
					range: "min",
					min: bmin,
					max: bmax,
					value: bmin,
					animate: "fast",
					slide: function(event, ui)
					{
						if (ui)
						{
							sliderMoneyToPay = ui.value * 1000;
							moneyToPay = sliderMoneyToPay * dMultiplayer.getSabotageMultiplication();
							budgetFactor = (ui.value / bmax) - 0.05;
							$("#sabotageBudgetSlider").slider("value", ui.value);
							$("#sabotageCost").html("Cost:".dlocalize(modid) + " " + UI.getShortNumberString(moneyToPay));
							
							if (GameManager.company.cash > moneyToPay)
							{
								$("#sabotageCost").css("color", "black");
								
								if (isTargetSelected && $("#sabotageButton").hasClass("disabledButton"))
									$("#sabotageButton").removeClass("disabledButton").addClass("orangeButton");
							}
							else
							{
								$("#sabotageCost").css("color", "red");
								
								if ($("#sabotageButton").hasClass("orangeButton"))
									$("#sabotageButton").removeClass("orangeButton").addClass("disabledButton");
							}
						}
					}
				}));
					
				$("#sabotageOptions").empty();
				var options = ["Hack Interviews".dlocalize(modid), "Corrupt Game in Development".dlocalize(modid), "Assassinate Employee".dlocalize(modid)];
				for (var sabotageoption in customSabotage)
					if (customSabotage[sabotageoption].label !== undefined && customSabotage[sabotageoption].canUse())
						options.push(customSabotage[sabotageoption].label);
				
				options.forEach(function(option, i)
				{
					var listitem = $("<div class=\"selectableGameFeatureItem" + (i === 0 ? " selectedFeature" : "") + "\">" + option + "</div>");
					listitem.val(i);
					listitem.clickExcl(function()
					{
						if (!listitem.hasClass("selectedFeature"))
						{
							Sound.click();
							$("#sabotageOptions").find(".selectedFeature").removeClass("selectedFeature");
							listitem.addClass("selectedFeature");
							moneyToPay = sliderMoneyToPay * dMultiplayer.getSabotageMultiplication();
							
							if (GameManager.company.cash > moneyToPay)
							{
								if (isTargetSelected && $("#sabotageButton").hasClass("disabledButton"))
									$("#sabotageButton").removeClass("disabledButton").addClass("orangeButton");
								
								$("#sabotageCost").css("color", "black");
							}
							else 
							{
								if (isTargetSelected && $("#sabotageButton").hasClass("orangeButton"))
									$("#sabotageButton").removeClass("orangeButton").addClass("disabledButton");
								
								$("#sabotageCost").css("color", "red");
							}
						}
						else return;
							
						$("#sabotageCost").html("Cost:".dlocalize(modid) + " " + UI.getShortNumberString(moneyToPay));
					});
					$("#sabotageOptions").append(listitem);
				});
			},
			onClose: function()
			{
				GameManager.resume(true);
			}
		});
	};
	
	dMultiplayer.disconnect = function(cancelonclose)
	{
		cancelOnClose = cancelonclose;
		socket.close();
		
		if (!cancelonclose)
			socket.onclose();
	};
	
	dMultiplayer.log = function(str, ismessage)
	{
		var date = new Date();
		var message = "[" + date.toLocaleTimeString() + "] " + str + "\n";
		statusLog += message;
		
		if (ismessage)
			messageLog += message;
		
		dMultiplayer.updateChatLog();
		$("#chatArea").scrollTop($("#chatArea")[0].scrollHeight);
	};
	
	dMultiplayer.getGameStats = function()
	{
		var platformcount = GameManager.company.licencedPlatforms.filter(function(platinarr)
		{
			return platinarr.isCustom;
		}).length;
		
		var genresused = {};
		var avgcosts = 0;
		var avgincome = 0;
		var avgscore = 0;
		
		GameManager.company.gameLog.forEach(function(gameinarr)
		{
			genresused[gameinarr.genre.id] > 0 ? genresused[gameinarr.genre.id]++ : genresused[gameinarr.genre.id] = 1;
			
			if (gameinarr.costs)
				avgcosts += gameinarr.costs / GameManager.company.gameLog.length;
			if (gameinarr.revenue)
				avgincome += gameinarr.revenue / GameManager.company.gameLog.length;
			if (gameinarr.score)
				avgscore += gameinarr.score / GameManager.company.gameLog.length;
		});
		var favouritegenre = dMultiplayer.getFavouriteGenre(genresused);
		
		var retval =
		{
			platformcount: platformcount,
			favouritegenre: favouritegenre,
			avgcosts: avgcosts,
			avgincome: avgincome,
			avgscore: avgscore
		};
		
		return retval;
	};
	
	dMultiplayer.getFavouriteGenre = function(genresused)
	{
		var favouritegenre = "None".dlocalize(modid);
		var largestvalue = 0;
		for (var genre in genresused)
		{
			if (genresused[genre] > largestvalue)
			{
				favouritegenre = genre;
				largestvalue = genresused[genre];
			}
		}
		
		return favouritegenre;
	};
	
	dMultiplayer.getHighScore = function()
	{
		var highscores = DataStore.getHighScoreList();
		var largestvalue = 0;
		var iscurrentcompany = false;
		
		if (GameManager.company)
		{
			for (var i = 0; i < highscores.length; i++)
			{
				if (highscores[i].score !== undefined)
				{
					largestvalue = Math.max(largestvalue, highscores[i].score);
					iscurrentcompany = highscores[i].name == GameManager.company.name;
				}
			}
		}
		
		return (iscurrentcompany ? "0" : "") + (Math.round(largestvalue * 100) / 100);
	};
	
	dMultiplayer.sendCompany = function(loop)
	{
		if (!GameManager.company || !isConnected) return;
		
		if (!sentRQ)
		{
			dMultiplayer.sendStatus("REQCOMP");
			sentRQ = true;
		}
		
		var gamestats = dMultiplayer.getGameStats();
		var highscore = dMultiplayer.getHighScore();
		
		var playerdata = GameManager.company.name + sep + GameManager.company.staff[0].name + sep + Math.floor(GameManager.company.cash) + sep + Math.floor(GameManager.company.fans) + sep + Math.floor(GameManager.company.researchPoints) + sep + Math.floor(GameManager.company.currentWeek) + sep + GameManager.company.staff.length + sep + gamestats.platformcount + sep + GameManager.company.gameLog.length + sep + gamestats.favouritegenre + sep + gamestats.avgcosts + sep + gamestats.avgincome + sep + gamestats.avgscore + sep + highscore;
		if (!sentJoin)
		{
			playerdata += sep + "join";
			sentJoin = true;
		}
		
		dMultiplayer.sendStatus("COMPANY", playerdata);
		dMultiplayer.sendConsole(false);
		
		if (loop)
		{
			setTimeout(function() { dMultiplayer.sendCompany(true); }, 5000);
			loopingSC = true;
		}
	};
	
	dMultiplayer.sendConsole = function(rel)
	{
		if (GameManager.company.getLatestCustomConsole())
		{
			var console = GameManager.company.getLatestCustomConsole();
			var consoleData = console.id + sep + console.iconUri + sep + console.name + sep + console.published + sep + console.genreWeightings.join(":") + sep + console.audienceWeightings.join(":") + sep + console.techLevel + sep + console.startAmount.toString().split("e")[0] + sep + console.unitsSold.toString().split("e")[0];
			
			if (rel)
				consoleData += sep + "rel";
			
			dMultiplayer.sendStatus("CONSOLE", consoleData);
		}
	};
	
	dMultiplayer.arrestCEO = function()
	{
		GameManager.company.staff[0].efficiency = 0;
		GameManager.company.staff[0].goOnVacation();
	};
	
	dMultiplayer.sendCEOToPrison = function()
	{
		var searchattempts = 0;
		var replacement = Math.ceil(GameManager.company.getRandom() * GameManager.company.staff.length - 1);
		while (GameManager.company.staff[replacement].state == "Researching")
		{
			replacement = Math.ceil(GameManager.company.getRandom() * GameManager.company.staff.length - 1);
			searchattempts++;
			
			if (searchattempts > 9)
			{
				dMultiplayer.getStorage().data.goingtoprison = true;
				return;
			}
		}
		
		for (var field in GameManager.company.staff[0])
			if (typeof GameManager.company.staff[0][field] !== "function" && field != "id" && field != "salary" && field != "slot")
				GameManager.company.staff[0][field] = GameManager.company.staff[replacement][field];
		
		GameManager.company.staff[0].efficiency = 1;
		GameManager.company.staff[0].flags.needsVacation = false;
		GameManager.company.staff[0].flags.nextVacation = 10800000;
		
		GameManager.company.staff[replacement].fire();
		VisualsManager.resetAllCharacters();
	};
	
	dMultiplayer.getObjectArrayIndex = function(array, _item, _value, last)
	{
		var objs = $.map(array, function(objinarr, i)
		{
			if (!objinarr) return undefined;
			
			var item = typeof objinarr[_item] === "string" ? objinarr[_item].toLowerCase() : objinarr[_item];
			var value = typeof _value === "string" ? _value.toLowerCase() : _value;
			
			if (item == value)
				return i;
		});
		
		return (last) ? objs.last() : objs[0];
	};
	
	dMultiplayer.getObjectArrayIndexStarting = function(array, item, value, last)
	{
		var objs = $.map(array, function(objinarr, _index)
		{
			if (value.toLowerCase().indexOf(objinarr[item].toLowerCase()) === 0)
			{
				var obj =
				{
					index: _index,
					rest: value.substr(objinarr[item].length)
				};
				return obj;
			}
		});
		
		return (last) ? objs.last() : objs[0];
	};
	
	dMultiplayer.fixEmptyDuplicateArrayElements = function(arr)
	{
		for (var i = 0; i < arr.length; i++)
		{
			if (arr[i] === undefined || arr[i] === null || (i > 0 && arr[i] === arr[i - 1]))
			{
				arr.splice(i, 1);
				i--;
			}
		}
	};
	
	dMultiplayer.switchServer = function()
	{
		if ($("#switchButton").hasClass("disabledButton")) return;
		dMultiplayer.initData(true);
	};
	
	dMultiplayer.sendChat = function()
	{
		if (!isConnected || !chatOpen || $("#chatInput").val() === "" || $("#chatButton").hasClass("disabledButton")) return;
		
		Sound.click();
		$("#chatButton").removeClass("orangeButton").addClass("disabledButton");
		
		var datatosend = $("#chatInput").val();
		$("#chatInput").val("");

		setTimeout(function()
		{
			$("#chatButton").removeClass("disabledButton").addClass("orangeButton");
		}, 500);
		
		if (datatosend[0] != "/")
		{
			dMultiplayer.sendStatus("MSG", datatosend);
			
			var opprefix = opped ? "@" : "";
			dMultiplayer.log("<" + opprefix + GameManager.company.staff[0].name + "> " + datatosend, true);
		}
		else
		{
			var command = datatosend.substr(1).split(" ");
			switch (command[0].toLowerCase())
			{
				case "commands":
					dMultiplayer.log("{0} - Shows this message".dlocalize(modid).format("/commands"), true);
					dMultiplayer.log("{0} <company/player> - Hide messages from a certain player in the chat".dlocalize(modid).format("/mute"), true);
					dMultiplayer.log("{0} - Shows what settings the server uses".dlocalize(modid).format("/srvsettings"), true);
					dMultiplayer.log("{0} <company/player> <message> - Private message a player".dlocalize(modid).format("/tell"), true);
					dMultiplayer.log("{0} <message> - Private message the player you last messaged".dlocalize(modid).format("/tellre"), true);
					dMultiplayer.log("{0} <company/player> - Disables hiding of messages from a player".dlocalize(modid).format("/unmute"), true);
					break;
				
				case "mute":
				case "unmute":
					var muting = command[0].toLowerCase() == "mute";
					var target = datatosend.substr(datatosend.indexOf(" ") + 1);
					var bossindex = dMultiplayer.getObjectArrayIndex(competitors, "boss", target, true);
					var companyindex = dMultiplayer.getObjectArrayIndex(competitors, "name", target, true);

					if ((bossindex || bossindex === 0) && competitors[bossindex])
					{
						competitors[bossindex].muted = muting;
						muting ? dMultiplayer.log("Muted player.".dlocalize(modid), true) : dMultiplayer.log("Unmuted player.".dlocalize(modid), true);
					}
					else if ((companyindex || companyindex === 0) && competitors[companyindex])
					{
						competitors[companyindex].muted = muting;
						muting ? dMultiplayer.log("Muted player.".dlocalize(modid), true) : dMultiplayer.log("Unmuted player.".dlocalize(modid), true);
					}
					else
						muting ? dMultiplayer.log("Couldn't mute player (not online?)".dlocalize(modid), true) : dMultiplayer.log("Couldn't unmute player (not online?)".dlocalize(modid), true);

					break;
				
				case "srvsettings":
					dMultiplayer.log("Can use offline players' consoles: {0}".dlocalize(modid).format(settings.offlineconsoles ? "Enabled".dlocalize(modid) : "Disabled".dlocalize(modid)), true);
					dMultiplayer.log("Can use competitors' consoles before release date: {0}".dlocalize(modid).format(settings.syncconsoles ? "Enabled".dlocalize(modid) : "Disabled".dlocalize(modid)), true);
					dMultiplayer.log("Time synchronization: {0}".dlocalize(modid).format(settings.timesync ? "Enabled".dlocalize(modid) : "Disabled".dlocalize(modid)), true);
					dMultiplayer.log("Review scores affect other players: {0}".dlocalize(modid).format(settings.reviewbattle ? "Enabled".dlocalize(modid) : "Disabled".dlocalize(modid)), true);
					break;

				case "tell":
					var query = datatosend.substr(datatosend.indexOf(" ") + 1);
					var bossindex = dMultiplayer.getObjectArrayIndexStarting(competitors, "boss", query, true);
					var companyindex = dMultiplayer.getObjectArrayIndexStarting(competitors, "name", query, true);
					var bossindexf = dMultiplayer.getObjectArrayIndexStarting(competitors, "boss", query);
					var companyindexf = dMultiplayer.getObjectArrayIndexStarting(competitors, "name", query);
					
					if ((bossindex && bossindexf && bossindex.index != bossindexf.index) || (companyindex && companyindexf && companyindex.index != companyindexf.index))
						dMultiplayer.log("Multiple players with that name exist. Couldn't send message.".dlocalize(modid), true);
					else if (bossindex && competitors[bossindex.index])
					{
						var message = bossindex.rest.substr(1);
						if ($.trim(message))
						{
							dMultiplayer.sendStatus("PRIVMSG", competitors[bossindex.index].id + sep + message);
							
							var bosspart1 = (opped ? "[@" : "[") + GameManager.company.staff[0].name;
							dMultiplayer.log("[" + bosspart1 + " -> " + competitors[bossindex.index].boss + "] " + message, true);
							
							lastPMPlayerIndex = bossindex.index;
						}
					}
					else if (companyindex && competitors[companyindex.index])
					{
						var message = companyindex.rest.substr(1);
						if ($.trim(message))
						{
							dMultiplayer.sendStatus("PRIVMSG", competitors[companyindex.index].id + sep + message);
							
							var bosspart1 = (opped ? "[@" : "[") + GameManager.company.staff[0].name;
							dMultiplayer.log("[" + bosspart1 + " -> " + competitors[companyindex.index].boss + "] " + message, true);
							
							lastPMPlayerIndex = companyindex.index;
						}
					}
					else
						dMultiplayer.log("Couldn't PM player (not online)".dlocalize(modid), true);
					
					break;
				
				case "tellre":
					if (lastPMPlayerIndex > -1)
					{
						if (competitors[lastPMPlayerIndex] && datatosend.indexOf(" ") > -1)
						{
							var message = datatosend.substr(datatosend.indexOf(" ") + 1);
							if ($.trim(message))
							{
								dMultiplayer.sendStatus("PRIVMSG", competitors[lastPMPlayerIndex].id + sep + message);
								dMultiplayer.log("[" + GameManager.company.staff[0].name + " -> " + competitors[lastPMPlayerIndex].boss + "] " + message, true);
							}
						}
						else
							dMultiplayer.log("Couldn't PM player (not online)".dlocalize(modid), true);
					}
					else
						dMultiplayer.log("Couldn't PM player (you haven't sent a private message to a player before)".dlocalize(modid), true);
					
					break;

				default:
					dMultiplayer.sendStatus("MSG", datatosend);
			}
		}
	};
	
	dMultiplayer.directConnect = function()
	{
		if ($("#DCInput").val() === "" || $("#DCButton").hasClass("disabledButton")) return;
		dMultiplayer.initSocket($("#DCInput").val());
		UI.closeModal();
	};
	
	dMultiplayer.trade = function()
	{
		if ($("#tradeNextButton").hasClass("disabledButton")) return;
		
		Sound.click();
		var competitorindex = dMultiplayer.getObjectArrayIndex(competitors, "id", parseInt($("#tradeTargets").find(".selectedFeature").val()));
		
		if (competitorindex !== undefined)
		{
			var competitor = competitors[competitorindex];
			
			var type = parseInt($("#tradeType").find(".selectedFeature").val());
			
			switch (type)
			{
				case 0:
					type = "reqrp";
					break;
				
				case 1:
					type = "reqcash";
			}
			
			var n = new Notification(
			{
				header: "{0} trade".dlocalize(modid).format(competitor.name),
				text: "The offer has been sent.".dlocalize(modid)
			});
			GameManager.company.activeNotifications.addRange(n.split());
			dMultiplayer.sendStatus("TRADEREQ", competitor.id + sep + type + sep + RPToPay + sep + moneyToPay);
			
			UI.closeModal();
		}
		else
		{
			UI.closeModal();
			dMultiplayer.showTradeWindow();
		}
	};
	
	dMultiplayer.coDevelopGame = function()
	{
		if ($("#coGameButton").hasClass("disabledButton")) return;
		
		Sound.click();
		
		if (isTargetSelected)
		{
			var competitorindex = dMultiplayer.getObjectArrayIndex(competitors, "id", parseInt($("#coGameTargets").find(".selectedFeature").val()));
			if (competitorindex !== undefined)
			{
				var competitor = competitors[competitorindex];
				
				var name = $(".simplemodal-data").find("#gameTitle")[0].value;
				
				var size;
				var sizebutton = $(".simplemodal-data").find(".gameSizeButton.selected");
				
				if (sizebutton.hasClass("gameSizeMedium"))
					size = "Medium"
				else if (sizebutton.hasClass("gameSizeLarge"))
					size = "Large";
				else if (sizebutton.hasClass("gameSizeAAA"))
					size = "AAA";
				else
					size = "Small";
				
				var mmo = $(".simplemodal-data").find(".gameGenreMMO").hasClass("selected");
				
				var topic = GameManager.company.topics.first(function(topicinarr)
				{
					return topicinarr.name == $(".simplemodal-data").find(".pickTopicButton").text();
				}).id;
				
				var pregenre = GameGenre.getAll().first(function(genreinarr)
				{
					return genreinarr.name == $(".simplemodal-data").find("#pickGenreButton").text();
				});
				
				if (pregenre)
					genre = pregenre.id;
				
				var genre2;
				
				if ($(".simplemodal-data").find("#pickSecondGenreButton").text() != "Pick Genre".localize())
				{
					var pregenre2 = GameGenre.getAll().first(function(genreinarr)
					{
						return genreinarr.name == $(".simplemodal-data").find("#pickSecondGenreButton").text();
					});
					
					if (pregenre2)
						genre2 = pregenre2.id;
				}
				
				var platforms = "";
				var platformbuttons = $(".simplemodal-data").find(".pickPlatformButton");
				for (var i = 0; i < 3; i++)
				{
					if (platformbuttons.length > i)
					{
						var platform = platformbuttons[i].innerText;
						Platforms.allPlatforms.forEach(function(platinarr)
						{
							var pushed = false;
							if (!pushed && platinarr.name == platform)
							{
								if (i > 0)
									platforms += sep2;
								
								platforms += platinarr.id;
								pushed = true;
							}
						});
					}
				}
				
				var audience;
				var audiencebutton = $(".simplemodal-data").find(".rating.selected");
				if (audiencebutton.hasClass("ratingY"))
					audience = "Young";
				else if (audiencebutton.hasClass("ratingM"))
					audience = "Mature";
				else
					audience = "Everyone";
				
				var engine = $(".simplemodal-data").find(".pickEngineButton").text();
				engine = JSON.stringify(GameManager.company.engines.first(function(engineinarr)
				{
					return engineinarr.name == engine;
				}));
				
				var features = JSON.stringify(UI._getSelectedFeatures());
				
				var gameid = dMultiplayer.getRandomInteger();
				
				coSentID = competitor.id;
				dMultiplayer.sendStatus("COGREQ", competitor.id + sep + coCost + sep + coRevenue + sep + name + sep + size + sep + mmo + sep + topic + sep + genre + sep + genre2 + sep + platforms + sep + audience + sep + engine + sep + features + sep + gameid);
				
				canCloseDialog = false;
				canSelectTarget = false;
				
				$("#coGameCostSlider").find(".budgetSlider").slider("option", "disabled", true);
				$("#coGameRevenueSlider").find(".budgetSlider").slider("option", "disabled", true);
				
				$("#coGameBackButton").clickExcl(function() { });
				
				if ($("#coGameButton").hasClass("orangeButton"))
					$("#coGameButton").removeClass("orangeButton").addClass("disabledButton");
				
				dMultiplayer.updateStartDevelopmentButton(20);
			}
		}
		else
			UI.closeGameDefinition();
	};
	
	dMultiplayer.advancedSpy = function()
	{
		if ($("#advSpyButton").hasClass("disabledButton") || moneyToPay > GameManager.company.cash) return;
		
		Sound.click();
		
		var competitorindex = dMultiplayer.getObjectArrayIndex(competitors, "id", parseInt($("#advSpyTargets").find(".selectedFeature").val()));
		if (competitorindex !== undefined)
		{
			var competitor = competitors[competitorindex];
			
			var n = new Notification(
			{
				header: "{0} advanced spying".dlocalize(modid).format(competitor.name),
				text: "We'll start working on it immediately.\nAgent Rijndael".dlocalize(modid)
			});
			GameManager.company.activeNotifications.addRange(n.split());
			
			GameManager.company.adjustCash(moneyToPay * -1, "Donation to charity".dlocalize(modid));
			dMultiplayer.sendStatus("ADVSPY", competitor.id + sep + budgetFactor);
			
			UI.closeModal();
		}
		else
		{
			UI.closeModal();
			dMultiplayer.showAdvSpyWindow();
		}
	};
	
	dMultiplayer.sabotage = function()
	{
		if ($("#sabotageButton").hasClass("disabledButton") || moneyToPay > GameManager.company.cash) return;
		
		Sound.click();
		var type = parseInt($("#sabotageOptions").find(".selectedFeature").val());
		
		if (type == 2 && GameManager.company.staff.length < 2)
		{
			$("#confirmAssassinDialog").dialog(
			{
				draggable: false,
				modal: true,
				resizable: false,
				show: "fade",
				zIndex: 7000,
				title: "Attention".dlocalize(modid),
				open: function()
				{
					multiplayerDialogOpen = true;
					$(this).siblings(".ui-dialog-titlebar").remove();
					
					$("#assassinNoButton").clickExclOnce(function()
					{
						Sound.click();
						$("#confirmAssassinDialog").dialog("close");
					});
					
					$("#assassinYesButton").clickExclOnce(function()
					{
						Sound.click();
						$("#confirmAssassinDialog").dialog("close");
						
						dMultiplayer._sabotage(type);
					});
				},
				close: function()
				{
					$(this).dialog("destroy");
					this.style.cssText = "display: none;";
				}
			});
		}
		else
			dMultiplayer._sabotage(type);
	};
	
	dMultiplayer._sabotage = function(typeid)
	{
		var competitorindex = dMultiplayer.getObjectArrayIndex(competitors, "id", parseInt($("#sabotageTargets").find(".selectedFeature").val()));
		if (competitorindex !== undefined)
		{
			var competitor = competitors[competitorindex];
			var type;
			
			switch (typeid)
			{
				case 0:
					type = "hackinterviews";
					break;
				
				case 1:
					type = "ruingame";
					break;
				
				case 2:
					type = "assassin";
					break;
				
				default:
					for (var sabotageoption in customSabotage)
					{
						if (customSabotage[sabotageoption].typeid == typeid)
						{
							type = sabotageoption;
							break;
						}
					}
			}
			
			var n = new Notification(
			{
				header: "{0} sabotage".dlocalize(modid).format(competitor.name),
				text: "We'll start working on it immediately.\nAgent Rijndael".dlocalize(modid)
			});
			GameManager.company.activeNotifications.addRange(n.split());
			
			GameManager.company.adjustCash(moneyToPay * -1, "Donation to charity".dlocalize(modid));
			dMultiplayer.sendStatus("SABOTAGE", competitor.id + sep + (Math.round(budgetFactor * 10000) / 10000) + sep + type);
			
			if (type == "assassin")
				dMultiplayer.getStorage().data.assassintrycount++;
							
			UI.closeModal();
		}
		else
		{
			UI.closeModal();
			dMultiplayer.showSabotageWindow();
		}
	};
	
	dMultiplayer.getSabotageMultiplication = function()
	{
		var times = 1;
		var typeid = parseInt($("#sabotageOptions").find(".selectedFeature").val());
		switch (typeid)
		{
			case 0:
				times = 1;
				break;
			
			case 1:
				times = 4;
				break;
			
			case 2:
				times = 15;
				break;
			
			default:
				for (var sabotageoption in customSabotage)
				{
					if (customSabotage[sabotageoption].typeid == typeid)
					{
						times = customSabotage[sabotageoption].multiplication;
						break;
					}
				}
		}
		return times;
	};
	
	dMultiplayer.overwriteObjectByID = function(obj, newobj, type)
	{
		for (var i = 0; i < obj.length; i++)
		{
			if (obj[i].id == newobj.id)
			{
				var olddate;
				if (type == "console")
					olddate = obj[i].published;
				
				obj[i] = $.extend(true, {}, newobj);
				pushNew = false;
				
				if (type == "console")
					obj[i].published = olddate;
			}
		}
	};
	
	dMultiplayer.tradeSliders = function(tmin, tmin2)
	{
		$("#tradeCost").html("Research Points:".dlocalize(modid) + " 0<br />" + "Cash:".dlocalize(modid) + " 0");
		RPToPay = 0;
		moneyToPay = 0;
		
		if (isTargetSelected)
		{
			var index = dMultiplayer.getObjectArrayIndex(competitors, "id", parseInt($("#tradeTargets").find(".selectedFeature").val()));
			
			if ($("#tradeType").find(".selectedFeature").val() == 0)
			{
				tmax = competitors[index].rp;
				tmax2 = GameManager.company.cash;
				$("#tradeRPText").text("Research Points (request)".dlocalize(modid));
				$("#tradeCashText").text("Cash (offer)".dlocalize(modid));
			}
			else
			{
				tmax = GameManager.company.researchPoints;
				tmax2 = competitors[index].cash;
				$("#tradeRPText").text("Research Points (offer)".dlocalize(modid));
				$("#tradeCashText").text("Cash (request)".dlocalize(modid));
			}
		}
								
		$("#tradeRPSlider").empty();
		$("#tradeRPSlider").append($("<div class=\"budgetSlider\"></div>").slider(
		{
			orientation: "horizontal",
			range: "min",
			min: tmin,
			max: tmax,
			value: tmin,
			animate: "fast",
			slide: function(event, ui)
			{
				if (ui)
				{
					RPToPay = ui.value;
					$("#tradeRPSlider").slider("value", ui.value);
					$("#tradeCost").html("Research Points:".dlocalize(modid) + " " + RPToPay + "<br />" + "Cash:" + " " + UI.getShortNumberString(moneyToPay));
				}
			}
		}));
		
		$("#tradeCashSlider").empty();
		$("#tradeCashSlider").append($("<div class=\"budgetSlider\"></div>").slider(
		{
			orientation: "horizontal",
			range: "min",
			min: tmin2,
			max: tmax2,
			value: tmin2,
			animate: "fast",
			slide: function(event, ui)
			{
				if (ui)
				{
					moneyToPay = ui.value;
					$("#tradeCashSlider").slider("value", ui.value);
					$("#tradeCost").html("Research Points:".dlocalize(modid) + " " + RPToPay + "<br />" + "Cash:".dlocalize(modid) + " " + UI.getShortNumberString(moneyToPay));
				}
			}
		}));
	};

	dMultiplayer.checkForUpdates = function(first)
	{
		var declinedUpdate = false;
		var log = first ? "true" : "false";

		$.get("http://data.gdtmp.tk/cversion?log=" + log, function(content)
		{
			if (!dMultiplayer.compareVersions(dmod.version, content, true))
				confirm("A GDTMP update is available! ({0})\nGo to the official forum thread for more info and downloads?".dlocalize(modid).format(content)) ? PlatformShim.openUrlExternal(dmod.url) : declinedUpdate = true;
		});

		if (!declinedUpdate)
			setTimeout(dMultiplayer.checkForUpdates, 1800000); //30 minutes
	};
	
	dMultiplayer.compareVersions = function(varr1, varr2, allowsame)
	{
		var splitversion = varr1.replace(/[^0-9.]/g, "").split(".");
		var splitdversion = varr2.replace(/[^0-9.]/g, "").split(".");
		
		if (splitversion.length != splitdversion.length) return false;
		
		var versionstr = "";
		for (var i = 0; i < splitversion.length; i++)
			versionstr += dMultiplayer.leadingZero(splitversion[i], splitdversion[i]);
			
		var dversionstr = "";
		for (var i = 0; i < splitdversion.length; i++)
			dversionstr += dMultiplayer.leadingZero(splitdversion[i], splitversion[i]);
		
		var versionnum = parseInt(versionstr);
		var dversionnum = parseInt(dversionstr);
			
		return (allowsame && versionnum >= dversionnum) || (!allowsame && versionnum > dversionnum);
	};
	
	dMultiplayer.leadingZero = function(number, comparisonnumber)
	{
		if (comparisonnumber)
		{
			var retval = number;
			while (("" + retval).length < ("" + comparisonnumber).length)
				retval = "0" + retval;
			
			return retval;
		}
		else
			return (number < 10) ? "0" + number : number;
	};
	
	dMultiplayer.plusPositive = function(number)
	{
		return (number > 0) ? "+" + number : number;
	};
	
	dMultiplayer.decapitalize = function(str, execute)
	{
		return (execute) ? str.charAt(0).toLowerCase() + str.slice(1) : str;
	};
	
	dMultiplayer.browserMouseOver = function(id)
	{
		$("#browserItem" + id).css("background", "#F7D7A3");
	};
	
	dMultiplayer.browserMouseOut = function(id)
	{
		$("#browserItem" + id).css("background", "#F9CE84");
	};
	
	dMultiplayer.browserMouseDown = function(event, id)
	{
		if (event.which !== 1) return;
		dMultiplayer.initSocket($("#browserIP" + id).text(), $("#browserDesc" + id).text());
		UI.closeModal();
	};
	
	dMultiplayer.connectFromHistory = function()
	{
		if ($("#browserServerHistory").val() == "none") return;
		dMultiplayer.initSocket($("#browserServerHistory").val(), $("#browserServerHistory option:selected").text());
		UI.closeModal();
	};
	
	dMultiplayer.pollServer = function(srv, id)
	{
		var ipPort = srv;
		var hasPort = srv.split(":").length > 1;
		if (!hasPort)
			ipPort += ":3966";
		
		var pollsocket = new WebSocket("ws://" + ipPort);
		
		pollsocket.onopen = function()
		{
			pollsocket.send("POLL");
		};
		
		pollsocket.onmessage = function(event)
		{
			var data = event.data.split(sep);
			var resid = data.pop();
			if (resid != serverID) return;
			
			switch (data[0])
			{
				case "KICK":
					pollsocket.close();
					break;
				
				case "POLLRES":
					var outdatedsomething = true;
					if (data.length > 4)
					{
						var playercount = data[1];
						var cheatmodallowed = data[2] == "True" ? "Allowed".dlocalize(modid) : "Not allowed".dlocalize(modid);
						var minversion = data[3];
						var description = data[4];
						
						var srvversion = "";
						if (data.length > 5)
							srvversion = data[5];
						
						$("#browserList").append("<tr id=\"browserItem" + id + "\"><td id=\"browserDesc" + id + "\"><div>" + description + "</div></td><td><div>" + playercount + "</div></td><td><div>" + cheatmodallowed + "</div></td><td id=\"browserIP" + id + "\"><div>" + srv + "</div></td></tr>");
						$("#browserItem" + id + " td div").css(
						{
							"overflow": "hidden",
							"height": "16px"
						});
						
						if (dMultiplayer.compareVersions(dmod.version, minversion, true) && dMultiplayer.compareVersions(srvversion, minsrvversion, true))
						{
							$("#browserItem" + id).mouseover(function() { dMultiplayer.browserMouseOver(id); });
							$("#browserItem" + id).mouseout(function() { dMultiplayer.browserMouseOut(id); });
							$("#browserItem" + id).mousedown(function(event) { dMultiplayer.browserMouseDown(event, id); });
						}
						else
						{
							if (!dMultiplayer.compareVersions(dmod.version, minversion, true))
								$("#browserItem" + id).attr("title", "The server requires a newer mod version.".dlocalize(modid));
							else if (!dMultiplayer.compareVersions(srvversion, minsrvversion, true))
								$("#browserItem" + id).attr("title", "The server is outdated.".dlocalize(modid));
							
							$("#browserItem" + id + " td div").css("color", "red");
						}
					}
			}
		};
	};
	
	dMultiplayer.disableKeyboard = function(event)
	{
		if (event.which > 9)
			event.preventDefault();
	};
	
	dMultiplayer.setConnected = function(connected)
	{
		isConnected = connected;
		
		if (connected && $("#chatButton").hasClass("disabledButton"))
			$("#chatButton").removeClass("disabledButton").addClass("orangeButton");
		else if (!connected && $("#chatButton").hasClass("orangeButton"))
			$("#chatButton").removeClass("orangeButton").addClass("disabledButton");
	};
	
	dMultiplayer.toggleListMinimized = function()
	{
		if (!listMinimized)
		{
			$("#gdtmpcard").height("60px");
			$("#gdtmpminimize").text("\u25A1");
			$("#gdtmpminimize").css("bottom", "101px");
			$("#gdtmpinfo").css("bottom", "101px");
			$("#gdtmpchat").css("bottom", "101px");
			listMinimized = true;
		}
		else
		{
			var height = dMultiplayer.fixListHeight(20 * (competitors.length - 5) > 0 ? 100 + 20 * (competitors.length - 5) : 100);
			$("#gdtmpcard").height(height + "px");
			$("#gdtmpminimize").text("_");
			$("#gdtmpminimize").css("bottom", ($("#gdtmpcard").height() + 41) + "px");
			$("#gdtmpinfo").css("bottom", ($("#gdtmpcard").height() + 41) + "px");
			$("#gdtmpchat").css("bottom", ($("#gdtmpcard").height() + 41) + "px");
			listMinimized = false;
		}
	};
	
	dMultiplayer.fixListHeight = function(height)
	{
		if (height > -1)
			return (height > window.innerHeight - 300) ? Math.floor((window.innerHeight - 300) / 20.0) * 20 : height;
		else if ($("#gdtmpcard").height() > window.innerHeight - 300)
			$("#gdtmpcard").height(dMultiplayer.fixListHeight($("#gdtmpcard").height()));
	};
	
	dMultiplayer.getStorage = function()
	{
		return GDT.getDataStore(modid);
	};
	
	dMultiplayer.sendCustomData = function(dataid, dataarr)
	{
		if (typeof dataid === "string" && dataid.length <= 24 && typeof dataarr === "object")
		{
			var datatosend = [];
			$.extend(true, datatosend, dataarr);
			
			for (var i = 1; i < dataarr.length; i++)
				datatosend.splice(i, 0, sep);
			
			dMultiplayer.sendStatus(dataid, datatosend.join(""));
			return true;
		}
		else return false;
	};
	
	dMultiplayer.addCustomReceiver = function(dataid, receiverfunction)
	{
		if (typeof dataid === "string" && dataid.length <= 24 && !customReceivers[dataid] && typeof receiverfunction === "function")
		{
			customReceivers[dataid] = receiverfunction;
			return true;
		}
		else return false;
	};
	
	dMultiplayer.addPreReceiver = function(dataid, receiverfunction)
	{
		if (typeof dataid === "string" && dataid.length <= 24 && typeof receiverfunction === "function")
		{
			customPreReceivers.push(
			{
				id: dataid,
				receiver: receiverfunction
			});
			return true;
		}
		else return false;
	};
	
	dMultiplayer.addPostReceiver = function(dataid, receiverfunction)
	{
		if (typeof dataid === "string" && dataid.length <= 24 && typeof receiverfunction === "function")
		{
			customPostReceivers.push(
			{
				id: dataid,
				receiver: receiverfunction
			});
			return true;
		}
		else return false;
	};
	
	dMultiplayer.getCompetitors = function()
	{
		var readonlycompetitors = [];
		$.extend(true, readonlycompetitors, competitors);
		return readonlycompetitors;
	};
	
	dMultiplayer.getCompetitorByID = function(id)
	{
		var readonlycompetitors = dMultiplayer.getCompetitors();
		return readonlycompetitors[dMultiplayer.getObjectArrayIndex(readonlycompetitors, "id", id)];
	};
	
	dMultiplayer.isConnected = function()
	{
		return isConnected;
	};
	
	dMultiplayer.getPlayerID = function()
	{
		return playerID;
	};
	
	dMultiplayer.getVersion = function()
	{
		return modsAtLoad[dMultiplayer.getObjectArrayIndex(modsAtLoad, "id", modid)].version;
	};
	
	dMultiplayer.addSabotageOption = function(sabotageobject)
	{
		if (typeof sabotageobject !== "undefined" && typeof sabotageobject.id === "string" && sabotageobject.id.length <= 24 && !customSabotage[sabotageobject.id] && typeof sabotageobject.canUseFunction === "function" && typeof sabotageobject.receiverFunction === "function")
		{
			customSabotage[sabotageobject.id] =
			{
				label: sabotageobject.label,
				multiplication: sabotageobject.costMultiplication,
				canUse: sabotageobject.canUseFunction,
				receiver: sabotageobject.receiverFunction,
				typeid: Object.keys(customSabotage).length + 3
			};
			return true;
		}
		else return false;
	};
	
	dMultiplayer.updateTopScore = function(lasttopscore, previoustopscore)
	{
		if (settings.reviewbattle && GameManager.company.lastTopScore > 0 && GameManager.company.previousTopScore > 0)
		{
			var lasttopscorediff = GameManager.company.lastTopScore / lasttopscore;
			if (lasttopscorediff > 0.95 && lasttopscorediff < 1.05)
				GameManager.company.lastTopScore = lasttopscore;
			else if (lasttopscorediff <= 0.95)
				GameManager.company.lastTopScore *= 0.99;
			else
				GameManager.company.lastTopScore *= 1.01;
				
			var previoustopscorediff = GameManager.company.previousTopScore / previoustopscore;
			if (previoustopscorediff > 0.95 && previoustopscorediff < 1.05)
				GameManager.company.previousTopScore = previoustopscore;
			else if (previoustopscorediff <= 0.95)
				GameManager.company.previousTopScore *= 0.99;
			else
				GameManager.company.previousTopScore *= 1.01;
		}
	}
	
	dMultiplayer.resetSettings = function()
	{
		settings =
		{
			offlineconsoles: false,
			reviewbattle: false,
			serversidesave: false,
			syncconsoles: true,
			version: "0.0.0.0",
			timesync: false
		};
	};
	
	dMultiplayer.updateCoGamePercentage = function(listvalue, slidervalue1, slidervalue2)
	{
		var competitorindex = dMultiplayer.getObjectArrayIndex(competitors, "id", listvalue);
		if (competitorindex !== undefined)
		{
			var competitor = competitors[competitorindex];
			
			$("#coGameCostComp1").text(slidervalue1 + "% " + GameManager.company.name).css("display", "inline");
			$("#coGameCostComp2").text(competitor.name + " " + (100 - slidervalue1) + "%").css("display", "inline");
			$("#coGameRevenueComp1").text(slidervalue2 + "% " + GameManager.company.name).css("display", "inline");
			$("#coGameRevenueComp2").text(competitor.name + " " + (100 - slidervalue2) + "%").css("display", "inline");
			
			UI._updateGameDefinitionCost();
		}
	};
	
	dMultiplayer.updateStartDevelopmentButton = function(timeleft)
	{
		if (gameDefinitionOpen)
		{
			if (timeleft > 0 && coSentID > -1)
			{
				$("#coGameButton").text(timeleft);
				setTimeout(function() { dMultiplayer.updateStartDevelopmentButton(timeleft - 1); }, 1000);
			}
			else
			{
				if ($("#coGameButton").hasClass("disabledButton"))
					$("#coGameButton").removeClass("disabledButton").addClass("orangeButton");
				
				$("#coGameCostSlider").find(".budgetSlider").slider("option", "disabled", false);
				$("#coGameRevenueSlider").find(".budgetSlider").slider("option", "disabled", false);
				
				dMultiplayer.setCoGameBackButton();
				
				canCloseDialog = true;
				canSelectTarget = true;
				coSentID = -1;
				
				$("#coGameButton").text("Make offer".dlocalize(modid));
			}
		}
	};
	
	dMultiplayer.setCoGameBackButton = function()
	{
		$("#coGameBackButton").clickExcl(function()
		{
			Sound.click();
			readyToCloseGameDef = false;
			
			$("#gameDefinition").find(".dialogScreen2").transition(
			{
				"margin-left": "0"
			});
			$("#coGameDialogScreen3").transition(
			{
				"margin-left": "200%"
			});
		});
	};
	
	dMultiplayer.sendCoGameAnnouncement = function(game)
	{
		if (lastAnnouncedGame != game.title)
		{
			var codeveloper = coID > -1 ? coID : coSentID;
			dMultiplayer.sendStatus("COGANN", game.title + sep + game.topic.id + sep + game.genre.id + sep + game.GDTMPID + sep + codeveloper);
			lastAnnouncedGame = game.title;
		}
	};
	
	dMultiplayer.sendCoGameScore = function(game)
	{
		if (!game.GDTMPScoreSent)
		{
			var target = coID > -1 ? coID : coSentID;
			if (target > -1 && game.GDTMPID > -1)
			{
				var reviewdata = "";
				for (var i = 0; i < 4; i++)
				{
					reviewdata += game.reviews[i].score;
					if (i < 3)
						reviewdata += sep;
				}
				dMultiplayer.sendStatus("COGSCORE", target + sep + reviewdata + sep + game.GDTMPID);
				dMultiplayer.sendStatus("COGREL", game.title + sep + game.topic.id + sep + game.genre.id + sep + game.GDTMPID + sep + target);
				game.GDTMPScoreSent = true;
				
				if (game.GDTMPScoreReceived)
				{
					coSentID = -1;
					coID = -1;
				}
			}
		}
		else if (game.GDTMPScoreReceived)
		{
			coSentID = -1;
			coID = -1;
		}
	};
	
	dMultiplayer.prepareCoGame = function(gameid, index)
	{
		GameManager.company.currentGame.GDTMPID = gameid;
		GameManager.company.currentGame.GDTMPCoCost = coCost;
		GameManager.company.currentGame.GDTMPCoRevenue = coRevenue;
		GameManager.company.currentGame.GDTMPCoCompanyFinished = false;
		GameManager.company.currentGame.GDTMPScoreSent = false;
		GameManager.company.currentGame.GDTMPScoreReceived = false;
		GameManager.company.currentGame.GDTMPSalesModifier = 1 + (competitors[index].fans / GameManager.company.fans);
	};
	
	dMultiplayer.canCoDevelop = function()
	{
		return !engineOpen && !contractOpen && !GameManager.company.isCurrentlyDevelopingGame() && !GameManager.currentContract && !GameManager.currentEngineDev && GameManager.company.staff.filter(function(a)
		{
			return a.state === CharacterState.Idle
		}).length > 0;
	};
	
	dMultiplayer.prepareGame = function(game)
	{
		var oriGetSalesAnomaly = GameManager.company.currentGame.getSalesAnomaly;
		var myGetSalesAnomaly = function()
		{
			var gameobject = GameManager.company.currentGame && GameManager.company.currentGame.id === game.id ? GameManager.company.currentGame : GameManager.company.gameLog[dMultiplayer.getObjectArrayIndex(GameManager.company.gameLog, "id", game.id)];
			var retval = oriGetSalesAnomaly.call(gameobject);
			
			if (gameobject.GDTMPSalesModifier !== undefined && gameobject.salesCashLog.length < 1)
			{
				if (retval === undefined)
					retval = 1;
				
				retval *= gameobject.GDTMPSalesModifier / 0.3;
			}
			
			return retval;
		};
		GameManager.company.currentGame.getSalesAnomaly = myGetSalesAnomaly;
	};
	
	dMultiplayer.handleAnnounceData = function(company, game, topic, genre)
	{
		dMultiplayer.displayMessage("{0} announced \"{1}\" ({2}/{3})".dlocalize(modid).format(company, game, topic, genre), false);
	};
	
	dMultiplayer.handleReleaseData = function(company, game, topic, genre, index)
	{
		dMultiplayer.displayMessage("{0} released \"{1}\" ({2}/{3})".dlocalize(modid).format(company, game, topic, genre), false);
		if (GameManager.company && GameManager.company.isCurrentlyDevelopingGame() && GameManager.company.currentGame.topic && GameManager.company.currentGame.getGenreDisplayName() == genre.localize() && GameManager.company.currentGame.similarGenreCount < 2)
		{
			var factor = Math.min(GameManager.company.fans, competitors[index].fans) / Math.max(GameManager.company.fans, competitors[index].fans);
			
			if (factor < 0.8)
				factor = 0.8;
			else if (GameManager.company.currentGame.GDTMPSalesModifier < 0.8)
				factor = 1;
			
			if (GameManager.company.currentGame.GDTMPSalesModifier === undefined)
				GameManager.company.currentGame.GDTMPSalesModifier *= factor;
			else
				GameManager.company.currentGame.GDTMPSalesModifier = 1;
			
			var n = new Notification(
			{
				header: "Similar Genre".dlocalize(modid),
				text: "{0}'s newly released game is a(n) {1} game, just like the game we're working on. This might negatively affect our sales.".dlocalize(modid).format(company, genre)
			});
			GameManager.company.activeNotifications.addRange(n.split());
			
			!GameManager.company.currentGame.similarGenreCount ? GameManager.company.currentGame.similarGenreCount = 1 : GameManager.company.currentGame.similarGenreCount++;
		}
	};
	
	dMultiplayer.sendPlatformDevelopmentMoney = function()
	{
		if (dMultiplayer.getStorage() && dMultiplayer.getStorage().data.mpplatforms)
		{
			var endfe = false;
			GameManager.company.currentGame.platforms.forEach(function(consinarr)
			{
				if (!endfe)
				{
					var index = dMultiplayer.getObjectArrayIndex(dMultiplayer.getStorage().data.mpplatforms, "id", consinarr.id);
					if (index !== undefined)
					{
						dMultiplayer.sendStatus("MONEY", index + sep + consinarr.developmentCosts + sep + "Platform development income");
						endfe = true;
					}
				}
			});
		}
	};
	
	dMultiplayer.parseServerSideData = function(saveinfo, parseddata)
	{
		parseddata.slot = "auto";
		parseddata.company.slot = "auto";
		GameManager.resume(true, true);
		
		serverSideLoading = true;
		window.localStorage["auto"] = saveinfo;
		window.localStorage["slot_auto"] = JSON.stringify(parseddata);
		GameManager.reload("auto", undefined, undefined, serverSideLoaded || parseddata.company.uid == GameManager.company.uid);
		serverSideLoaded = true;
	};
	
	dMultiplayer.getRandomInteger = function()
	{
		return Math.round(Math.random() * 100000000000);
	};
})();