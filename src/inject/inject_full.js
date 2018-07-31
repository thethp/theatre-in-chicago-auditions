chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "interactive") {
			clearInterval(readyStateCheckInterval);
			setAuditionState();
		}
	}, 10);
});

function setAuditionState() {
	var auditionURL = document.URL;
	var auditionKey = auditionURL.substring(auditionURL.indexOf('ID=') + 3);
	var auditionName = document.getElementsByClassName('detailAudSubHead')[0].innerText;

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

			initAuditionPosting(newAuditionObject);
		} else {
			let auditionData = auditionObject[auditionKey];
			auditionData.new = false;

			chrome.storage.sync.set({[auditionKey]: auditionData});

			initAuditionPosting(auditionData);
		}
	});

}

function initAuditionPosting(auditionData) {
	if(auditionData.uninterested) {
		var auditionManager = '<div class="audition-manager uninterested ' + auditionData.key + '"><span class="sixteen">&#10006;</span> - '+ auditionData.dateUninterested + ' - ' + auditionData.showName +' </div>';

	} else if(auditionData.applied) {
		var auditionManager = '<div class="audition-manager applied ' + auditionData.key + '"><span class="sixteen">&#10004;</span> - '+ auditionData.dateApplied + ' - ' + auditionData.showName +' </div>';

	} else {
		var auditionManager = document.createElement('div');
		auditionManager.className = "audition-manager " + auditionData.key;

		if(auditionData.new) {
			$(auditionManager).append('<span class="pr-10"><span class="new">&#9733;</span>  New</span>');
		}

		let markUninterestedInteraction = document.createElement('span');
		markUninterestedInteraction.className = "pr-10 clickable";
		markUninterestedInteraction.onclick = function() { markUninterested(auditionData); };
		$(markUninterestedInteraction).append('<span class="big-x">&#10006;</span> Mark Uninterested</span>');

		$(auditionManager).append(markUninterestedInteraction);

		let markAppliedInteraction = document.createElement('span');
		markAppliedInteraction.className = "pr-10 clickable";
		markAppliedInteraction.onclick = function() { markApplied(auditionData); };
		$(markAppliedInteraction).append('<span class="check">&#10004;</span> Mark Applied</span>');

		$(auditionManager).append(markAppliedInteraction);
	}

	$('.detailAudSubHead').after(auditionManager);
}

function markUninterested(auditionData) {
	let today = new Date();

	auditionData.uninterested = true;
	auditionData.dateUninterested = today.toLocaleDateString('en-us');
	$('.audition-manager.' + auditionData.key).remove();
	initAuditionPosting(auditionData);

	chrome.storage.sync.set({[auditionData.key]: auditionData});
}

function markApplied(auditionData) {
	let today = new Date();

	auditionData.applied = true;
	auditionData.dateApplied = today.toLocaleDateString('en-us');
	$('.audition-manager.' + auditionData.key).remove();
	initAuditionPosting(auditionData);

	chrome.storage.sync.set({[auditionData.key]: auditionData});
}


function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
