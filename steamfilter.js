var console_info = ["%cSteam Activity Filter by tjtheturtleisawesome(Jayleen Li)%c", "", ""];
console.log.apply(console, console_info);
/* 
	READ ME
	Made by tjtheturtleisawesome(Jayleen Li)
	Steam Profile: http://steamcommunity.com/id/tjtheturtleisawesome/
	GitHub: https://github.com/jayleenli
	
	Version 1.0 Features
	-Filtering your Steam Activity by friends list!
	-Hides the following types of posts from unselected users
		*Screenshots
		*New Games
		*Status Posts
		*Favorites
	-Storing your filter preferences in Chrome Storage
	-Works for Steam users with or without personalized Steam IDs
	
	Side Note: Why does steam use an old Jquery? makes this so much harder :)
	Mini ID's for steam are used because...
		-Not everyone has a steam ID set up
		-Users with steam IDs also have profile links, which can mess up coding
		-Steam mini ID's are the only consistent ID (and easier to get) to use
	
	Known Issues or Things to Improve on
	-Issue: Inefficient coding(but it still works!)
	-Issue: Does not work for next day Steam Activity (when it loads more activity when you scroll down)
	-Issue: Does not filter smaller info (ex, new friends, achievements, groups joined)
	-Future Feature?: Filter for groups
	-Future Feature?: Search for specific user
	-Future Feature?: Filter for the smaller info 
	-Future Feature?: Select All option/Deselect all option
*/

/*
	Creates the interface for Steam Activity Filter, places it on Steam Activity Page
*/
var div = document.createElement('div');
div.className = 'blotter_day';
document.getElementById('blotter_statuspost_form').appendChild(div);

/*
	Instantation variables
*/
var userFriendList = []; //array by [steam MINI profile ID]
var HTMLtoadd = ""; //for the list of friends on the filter
var usersToHideChromeStorage; 
var SAFslideshowDivs = [];
var currentlydisplayed = 1;

/*
	Get the friends link of the steam user
		-Works for with or without Steam ID
*/
var userElementHTML = $(".friendslist_entry_content").html();
var startProfileLink = userElementHTML.indexOf("href");
var endProfileLink = userElementHTML.indexOf("\"",startProfileLink+7);
var profileLink = userElementHTML.substring(startProfileLink+6,endProfileLink);
var friendsListLink = profileLink + "/friends/";
	 
//Add css style for SAF
var style = document.createElement('style');
style.type = 'text/css';
var SAFstyle = '.SAFarrows {border: solid black;border-width: 0 5px 5px 0;display: inline-block;padding: 5px;}.right {transform: rotate(-45deg);-webkit-transform: rotate(-45deg);}.left {transform: rotate(135deg);-webkit-transform: rotate(135deg);}';
style.innerHTML = SAFstyle;
document.getElementsByTagName('head')[0].appendChild(style);

/*
	Adding javascript on page for SAF
		-Function getGrandParent();
			Gets the grandparent element of the specified DOM element 
		-Function increaseOpacity();
			Increases Opacity of element
		-Function decreaseOpacity();
			Decreases Opacity of element
		-Function sortActivity();
			Gets all unchecked users and adds or removes saf-checked and checked attributes
*/
var getGrandParentString = 'function getGrandParent(e) {var result = [];var count = 0;for (var p = e && e.parentElement; p; p = p.parentElement) {'
getGrandParentString += 'if (count == 2){break;}else{result.push(p);count++;}}return result[1];}';

var opacityChangeScript = 'function increaseOpacity(x){x.style.opacity = "0.25";} function decreaseOpacity(x) {x.style.opacity = "0.15";}';

var sortActivityfunctString = "var usersToHide = [];"; 
sortActivityfunctString += 'var inputs = document.getElementsByClassName(\'SAFcheckbox\');';
sortActivityfunctString += 'for(var i = 0; i < inputs.length; i++) {';
sortActivityfunctString += 'if(inputs[i].checked == true) {inputs[i].setAttribute("saf-checked","true");inputs[i].setAttribute("checked","checked");}';
sortActivityfunctString += 'if(inputs[i].checked == false) {inputs[i].setAttribute("saf-checked","false");inputs[i].removeAttribute("checked");var innerHTMLofSAFcheckbox = inputs[i].outerHTML;';
sortActivityfunctString += 'var miniProfIDStart = innerHTMLofSAFcheckbox.indexOf(\'data-steamminiid\') + 18;';
sortActivityfunctString += 'var miniProfIDEnd = innerHTMLofSAFcheckbox.indexOf(\'"\',miniProfIDStart+2);';
sortActivityfunctString += 'var miniProfID = innerHTMLofSAFcheckbox.substring(miniProfIDStart, miniProfIDEnd); ';
sortActivityfunctString += 'usersToHide.push(miniProfID);}}';

var script = document.createElement('script');
script.type = "text/javascript";
var actualCode = '/*Steam Activity Filter Javascript*/\n';
actualCode += opacityChangeScript;
actualCode += getGrandParentString;
actualCode += 'function sortActivity(){';
actualCode += sortActivityfunctString + '}';

script.textContent = actualCode;
(document.head||document.documentElement).appendChild(script);

/*
	Get Chrome Storage
*/
chrome.storage.sync.get('usersToHideChromeStorage',function (obj)
{
	usersToHideChromeStorage = obj.usersToHideChromeStorage;
});

/*
	Gets entire friends list of user and gets the mini steam IDs for each friend
	Creates div with labels in it and places checked attributes (if applicable),
	Puts the divs into string array for the slideshow
*/
$.get(friendsListLink, null, function(text)
{
	var friends = $(text).find('.friendBlock');
	for(var i=0; i<friends.length; i++) 
	{
		var friend = friends[i];
		var StringedHTML = friend.innerHTML;
		var n = StringedHTML.indexOf("data-steamid"); //using input class=friend Checkbox data-steamid param
		var length = 14;
		var end = StringedHTML.indexOf("\"",n+length);
		var profileOrID = StringedHTML.substring(n+length,end);
		var miniProfIDStart = StringedHTML.indexOf("id=\"friendbox");
		var miniProfIDEnd = StringedHTML.indexOf("]", miniProfIDStart+19);
		var miniProfID = StringedHTML.substring(miniProfIDStart+19, miniProfIDEnd); //id="friendbox_[U:1:NUMBER]"
		var enddisplayloc = StringedHTML.indexOf("<br>");
		var displayloc = StringedHTML.indexOf("<div>",enddisplayloc-50); //guess and check ftw
		var displayName = StringedHTML.substring(displayloc+5, enddisplayloc);
		userFriendList.push(miniProfID); //NOTE-Mini steam ID
		var checkedbox = "checked=\"checked\"";
		
		//Check Chrome Storage
		if (usersToHideChromeStorage != undefined)
		{
			for (var c = 0; c < usersToHideChromeStorage.length; c++)
			{
				if (miniProfID == usersToHideChromeStorage[c])
				{
					checkedbox = null;
				}
			}
		}
		
		//If display name too long, reduce the characters so it doesn't mess up the slideshow look
		if (displayName.length >=27)
		{
			displayName = displayName.substring(0,27) + "...";
		}
		
		HTMLtoadd = HTMLtoadd + "<label><input class=\"SAFcheckbox\" data-steamid=\"" + profileOrID + "\" data-steamminiid=\"" + miniProfID + "\" type=\"checkbox\" ";
		if (checkedbox =="" || checkedbox == null)
		{
			HTMLtoadd = HTMLtoadd + "saf-checked=\"false\"";
		}
		else
		{
			HTMLtoadd = HTMLtoadd + checkedbox + "saf-checked=\"true\"";;
		}
		HTMLtoadd = HTMLtoadd + "><a style=\"text-decoration:none\"><span>" + displayName +"</span></a></label><br>";
		//For every 30, put into another div
		if (i%30 == 0)
		{
			SAFslideshowDivs.push(HTMLtoadd);
			HTMLtoadd = "";
		}
	}
	SAFslideshowDivs.push(HTMLtoadd);
	//Set the HTML inside SAF interface
	var SAFinnerHTML = '<div class="blotter_block es_highlight_checked"><div class="blotter_userstatus"><div class="blotter_group_announcement_header" style="padding-left:216px;"><div class="blotter_rollup_avatar blotter_group_container"><div class="mediumHolder_default"><div class="avatarMedium"><a href=""><img src=""></a></div></div></div>';
	SAFinnerHTML += '<div class="blotter_group_announcement_headline" style="vertical-align: middle;position:relative;top:25px;">Steam Activity Filter</div></div>';
	SAFinnerHTML += '<div style="width:100%;height:200px;"><div id="SAFarrowleft" onmouseover="increaseOpacity(this);" onmouseout="decreaseOpacity(this);" style="float:left;width:25px;height:200px;background-color:#ffffff;opacity: 0.15;"><i class="left SAFarrows" style="position:relative;top:50%;left:25%;"></i></div>';
	SAFinnerHTML += '<div id="SAFcheckboxholder" style="position:relative;float: left;-webkit-column-width: 185px;height: 200px;width:612px;">';
	SAFinnerHTML += SAFslideshowDivs[1];
	SAFinnerHTML += '</div>';
	SAFinnerHTML +=	'<div id="SAFarrowright" onmouseover="increaseOpacity(this);" onmouseout="decreaseOpacity(this);" style="float:left;width:25px;height:200px;background-color:#ffffff;opacity: 0.15;"><i class="right SAFarrows" style="position:relative;top:50%;left:25%;"></i></div></div>';
	SAFinnerHTML += '<br/><div style="position:relative; left:236px;margin-bottom:15px;" class="btn_grey_white_innerfade btn_small btn_uppercase" onclick="sortActivity();"><span id="SAFsortActivity">Filter and Save Information</span></div></div></div>';
	div.innerHTML = SAFinnerHTML;
	
	/*
		Slide show javascript (arrows)
			-Switches the displayed HTML friends list to other pages when the arrows are clicked
			-Also updates the divs if new actions are taken (checked/unchecked)
	*/
	$( "#SAFarrowleft" ).click(function() 
	{
		if (currentlydisplayed == 1){}
		else
		{
			var elem = document.getElementById("SAFcheckboxholder");
			var inputs = document.getElementsByClassName('SAFcheckbox');
			for(var i = 0; i < inputs.length; i++) 
			{
				if(inputs[i].checked == false) 
				{
					inputs[i].setAttribute("saf-checked","false");inputs[i].removeAttribute("checked");
				}
				else
				{
					inputs[i].setAttribute("saf-checked","true");inputs[i].setAttribute("checked","true");
				}
			}
		SAFslideshowDivs[currentlydisplayed] = elem.innerHTML;
		elem.innerHTML = SAFslideshowDivs[currentlydisplayed-1];
		currentlydisplayed = currentlydisplayed-1;
		}
	});

	$( "#SAFarrowright" ).click(function() 
	{
		if (currentlydisplayed == (SAFslideshowDivs.length-1)){}
		else
		{
			var elem = document.getElementById("SAFcheckboxholder");
			var inputs = document.getElementsByClassName('SAFcheckbox');
			for(var i = 0; i < inputs.length; i++) 
			{
				if(inputs[i].checked == false) 
				{
					inputs[i].setAttribute("saf-checked","false");inputs[i].removeAttribute("checked");
				}
				else
				{
					inputs[i].setAttribute("saf-checked","true");inputs[i].setAttribute("checked","true");
				}
			}
		SAFslideshowDivs[currentlydisplayed] = elem.innerHTML;
		elem.innerHTML = SAFslideshowDivs[currentlydisplayed+1];
		currentlydisplayed = currentlydisplayed+1;
		}
	});
	
	/*
		Activate filtering if Chrome Storage is already set, adds the same functions again
	*/
	function getGrandParent(e) {var result = [];var count = 0;for (var p = e && e.parentElement; p; p = p.parentElement) {if (count == 2){break;}else{result.push(p);count++;}}return result[1];}
	var elements2= document.getElementsByClassName("blotter_avatar_holder");
	if (usersToHideChromeStorage != undefined)
	{
		for (var x=1; x<elements2.length;x++) 
		{
			var avatarholder = elements2[x].innerHTML;var miniProfileStart = avatarholder.indexOf('data-miniprofile');
			var miniProfileEnd = avatarholder.indexOf('"',miniProfileStart+18);
			var miniProfileID = avatarholder.substring(miniProfileStart+18,miniProfileEnd);
			for (var u = 0; u < usersToHideChromeStorage.length; u++)
			{
				if (usersToHideChromeStorage[u] == miniProfileID){getGrandParent(elements2[x]).style.display='none';}
			}
		}
	}
});
	
/*
	When user clicks 'Filter and Save Information' Button
		-Checks all checkboxs based on div slideshow to see if its checked/unchecked
		-Filters based on preferences, hides the posts from unselected users
		-Puts the list of those on the 'hide' into Chrome Storage
*/
$('div').on('click', '#SAFsortActivity', function(event)
{
	var usersToHide = [];
	var elem = document.getElementById("SAFcheckboxholder");
	SAFslideshowDivs[currentlydisplayed] = elem.innerHTML;
	for (var e = 0; e < SAFslideshowDivs.length; e++)//running out of letters XD
	{
		var SAFslideshowToCheck = document.createElement("div");
		SAFslideshowToCheck.innerHTML = SAFslideshowDivs[e];
		var inputs = SAFslideshowToCheck.getElementsByClassName('SAFcheckbox');
		for(var i = 0; i < inputs.length; i++) 
		{
			if(inputs[i].getAttribute("saf-checked") == "false" || inputs[i].getAttribute("saf-checked") == false) 
			{
				var innerHTMLofSAFcheckbox = inputs[i].outerHTML;
				var miniProfIDStart = innerHTMLofSAFcheckbox.indexOf('data-steamminiid') + 18;
				var miniProfIDEnd = innerHTMLofSAFcheckbox.indexOf('"',miniProfIDStart+2);
				var miniProfID = innerHTMLofSAFcheckbox.substring(miniProfIDStart, miniProfIDEnd); 
				usersToHide.push(miniProfID);
			}
		}
	}
	function getGrandParent(e) {var result = [];var count = 0;for (var p = e && e.parentElement; p; p = p.parentElement) {if (count == 2){break;}else{result.push(p);count++;}}return result[1];}
	var elements2= document.getElementsByClassName("blotter_avatar_holder"); 
	for (var x=1; x<elements2.length;x++) //skip the first one because the first one is always the user - You don't want to block yourself XD!
	{
		var avatarholder = elements2[x].innerHTML;var miniProfileStart = avatarholder.indexOf('data-miniprofile');
		var miniProfileEnd = avatarholder.indexOf('"',miniProfileStart+18);
		var miniProfileID = avatarholder.substring(miniProfileStart+18,miniProfileEnd);
		getGrandParent(elements2[x]).style.display='block';
		for (var u = 0; u < usersToHide.length; u++)
		{
			if (usersToHide[u] == miniProfileID){getGrandParent(elements2[x]).style.display='none';}
		}
	}
	chrome.storage.sync.set({"usersToHideChromeStorage": usersToHide}, function() {});
});