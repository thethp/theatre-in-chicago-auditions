chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "interactive") {
			clearInterval(readyStateCheckInterval);
			$('td').on('click', '.audition-manager.toggleable', toggleShowDescription);
			initPage();
		}
	}, 10);
});

function initPage() {
	$('.style6').each(setAuditionState);
}

function setAuditionState(i, audition) {
	if(audition) {
		if(audition.getElementsByClassName('detailhead').length > 0) {
			var auditionURL = audition.getElementsByClassName('detailhead')[0].getElementsByTagName('a')[0].href;
			var auditionKey = auditionURL.substring(auditionURL.indexOf('ID=') + 3);
			var auditionName = audition.getElementsByClassName('detailbody')[0].innerText;

			chrome.storage.sync.get([auditionKey], function(auditionObject) {
				if(isEmpty(auditionObject)) {
					let newAuditionObject = {
						key: auditionKey,
						showName: auditionName,
						new: true,
						applied: false,
						dateApplied: '',
						uninterested: false,
						dateUninterested: ''
					}

					chrome.storage.sync.set({[auditionKey]: newAuditionObject});

					initAuditionPosting(audition, newAuditionObject);
				} else {
					let auditionData = auditionObject[auditionKey];
					auditionData.new = false;

					chrome.storage.sync.set({[auditionKey]: auditionData});

					initAuditionPosting(audition, auditionData);
				}
			});

		}
	}
}

function initAuditionPosting(auditionObj, auditionData) {
	if(auditionData.uninterested) {
		var auditionManager = '<div class="audition-manager uninterested clickable toggleable closed ' + auditionData.key + '"><span class="sixteen">&#10006;</span> - '+ auditionData.dateUninterested + ' - ' + auditionData.showName +' </div>';
		$(auditionObj).addClass('hide');

	} else if(auditionData.applied) {
		var auditionManager = '<div class="audition-manager applied clickable toggleable closed ' + auditionData.key + '"><span class="sixteen">&#10004;</span> - '+ auditionData.dateApplied + ' - ' + auditionData.showName +' </div>';
		$(auditionObj).addClass('hide');

	} else {
		var auditionManager = document.createElement('div');
		auditionManager.className = "audition-manager " + auditionData.key;

		if(auditionData.new) {
			$(auditionManager).append('<span class="pr-10"><span class="new">&#9733;</span>  New</span>');
		}

		let markUninterestedInteraction = document.createElement('span');
		markUninterestedInteraction.className = "pr-10 clickable";
		markUninterestedInteraction.onclick = function() { markUninterested(auditionObj,auditionData); };
		$(markUninterestedInteraction).append('<span class="big-x">&#10006;</span> Mark Uninterested</span>');

		$(auditionManager).append(markUninterestedInteraction);

		let markAppliedInteraction = document.createElement('span');
		markAppliedInteraction.className = "pr-10 clickable";
		markAppliedInteraction.onclick = function() { markApplied(auditionObj,auditionData); };
		$(markAppliedInteraction).append('<span class="check">&#10004;</span> Mark Applied</span>');

		$(auditionManager).append(markAppliedInteraction);
	}

	$(auditionObj).before(auditionManager);
	$(auditionObj).addClass('hideable');

}

function markUninterested(auditionObj,auditionData) {
	let today = new Date();

	auditionData.uninterested = true;
	auditionData.dateUninterested = today.toLocaleDateString('en-us');
	$('.audition-manager.' + auditionData.key).remove();
	initAuditionPosting(auditionObj, auditionData);

	chrome.storage.sync.set({[auditionData.key]: auditionData});
}

function markApplied(auditionObj,auditionData) {
	let today = new Date();

	auditionData.applied = true;
	auditionData.dateApplied = today.toLocaleDateString('en-us');
	$('.audition-manager.' + auditionData.key).remove();
	initAuditionPosting(auditionObj, auditionData);

	chrome.storage.sync.set({[auditionData.key]: auditionData});
}

function toggleShowDescription(e) {
	e.stopImmediatePropagation();
	if($(e.currentTarget).next().hasClass('hide')) {
		$(e.currentTarget).removeClass('closed');
		$(e.currentTarget).addClass('open');

		$(e.currentTarget).next().removeClass('hide');
	} else {
		$(e.currentTarget).addClass('closed');
		$(e.currentTarget).removeClass('open');

		$(e.currentTarget).next().addClass('hide');
	}
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
