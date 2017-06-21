 let headers = {};
 var rooster = {
 	userGenres: null,
 	dressingPlayLengthMin: null,
 	breakfastPlayLengthMin: null,
 	packedPlayLengthMin: null
 };
 rooster.url = 'https://api.spotify.com/v1'	

rooster.events = function(){$('form').on('submit', function(e){
	e.preventDefault();
//Get the user's morning activities and their endpoints:
	rooster.dressedTime = $('#dressed').val();
	rooster.breakfastTime = $('#breakfast').val();
	rooster.packedTime = $('#packed').val();
	console.log(rooster.dressedTime);
//baton pass of user time values:
	rooster.calculateActivityLength(rooster.dressedTime, rooster.breakfastTime, rooster.packedTime)
//listen for user selection of genres for playlists, and artist for rooster's song (so will recognize); Store these choices in a variable.
	// let roosterSong = $('#roosterSong').val();
	// // console.log(roosterSong);
	// rooster.getRoosterSong(roosterSong)
	//collect all the user's genre choices to filter through ajax request later
	rooster.userGenres = []
	$('input[name=genre]').each(function(){
		if (this.checked) {
			rooster.userGenres.push(this.value);
		}
});
	let search = rooster.userGenres.map(function(userGenre) {
		return rooster.getPlaylists(userGenre);
});
	// console.log(search);
rooster.retrieveArtistData(search)
	

		//Now I have an array of objects for each genre.  Within each objects there is an artist object, within that there is an items array with 20 different artists.  I need the ids to from each different object.

		//then i need to use the ids to get top tracks for each artist and store them in an array
		//backup, got albums, now need tracks.	
		///v1/artists/{id}/top-tracks
});
};
rooster.getAlbumsById = function(artistId){
	return $.ajax({
		url:`${rooster.url}/artists/${artistId}/albums`,
		method: 'GET',
		dataType: 'json',
		headers,
		data: {
			album_type: 'album',
			// q: 'artist',
			limit: 2
		}

	});
};


//calculate length of each segment from current time til endpoint.
rooster.calculateActivityLength = function(dressedLength, breakfastLength, packedLength){
	time = ((new Date().getHours()*60)) + (new Date().getMinutes())
	let dressingPlayLength = dressedLength.split(':');
	rooster.dressingPlayLengthMin = (((dressingPlayLength[0])*60) + parseInt(dressingPlayLength[1])) - time;
	let breakfastPlayLength =breakfastLength.split(':');
	rooster.breakfastPlayLengthMin = (((breakfastPlayLength[0])*60) + parseInt(breakfastPlayLength[1])) - (time + rooster.dressingPlayLengthMin);
	let packedPlayLength =packedLength.split(':');
	rooster.packedPlayLengthMin = (((packedPlayLength[0])*60) + parseInt(packedPlayLength[1])) - (time + rooster.breakfastPlayLengthMin + rooster.dressingPlayLengthMin);
	// console.log(dressingPlayLengthMin, breakfastPlayLengthMin, packedPlayLengthMin);
}
 
 //get rooster's song. first get the artist, user's "Rooster"

// rooster.getRoosterSong = function(roosterChoice){
// 	$.ajax({
// 		url:`${rooster.url}/search`,
// 		method: 'GET',
// 		dataType: 'json',
// 		data: {
// 			q: 'artist:' + roosterChoice,
// 			type: 'artist'
// 		}

// 	}).then(function(res){
// 		let roosterChoice = res.artists.items[0]
// 		// console.log(roosterChoice.id);

// 	});
// };
//then get albums from the artists ids

//then get multiple rooster tracks, then select ONE randomized from all, save in variable

//calculate length of Rooster song and subtract from time segments.

//Make second Spotify request for three chunks of music corresponding to (useractivity segments) - (rooster song duration).
rooster.getPlaylists = function(userGenre){
	console.log(userGenre)
	return $.ajax({
		url:`${rooster.url}/search`,
		method: 'GET',
		dataType: 'json',
		headers,
		data: {
			q: 'genre:' + userGenre,
			type: 'artist'
		}
	})
};


//Create playlist with three sections with alarm song at end of each.

//display rooster song to user so they will recognize it.  //display button to start the playlist which will also display a counter for each time section.

//start playlist and display Countdown counter

//get music from spotify to include in the mornign playlist that corresponds to user choice of genres
//create playlist equal to total duration of dressed, fed and packed. 3 playlists?  

// interrupt playlist at 3 different timepoints to play the morning rooster song
//display message
rooster.getArtistTracks = (id) => $.ajax({
	url: `${rooster.url}/albums/${id}/tracks`,
	method: 'GET',
	dataType: 'json',
	headers
});


rooster.retrieveArtistData = function(search){
	$.when(...search)
		.then(function(...playLists) {
			playLists = playLists.map(artist => artist[0].artists.items.map(res => res.id));
			var combinedArtistIdAlbums = playLists[0].concat(playLists[1])
			// console.log(combinedArtistIdAlbums);
			var albums = combinedArtistIdAlbums.map(function(id){
				 return rooster.getAlbumsById(id) 
			});
			rooster.retrieveArtistTracks(albums);
		});
}
rooster.retrieveArtistTracks = function(artistAlbums){
	$.when(...artistAlbums)
	.then((...albums) => {
		const albumIds = albums.map((promiseArray) => {
			return promiseArray[0].items[0].id;
		});
		// console.log('albumIds', albumIds);
		const tracks = albumIds.map(ids => rooster.getArtistTracks(ids));
		rooster.printArtistTracks(tracks);
		// albums.map(ids => rooster.getArtistTracks(ids));
	});

}

rooster.printArtistTracks = function(albumTracks) {
	$.when(...albumTracks)
	.then((...tracks) => {
			// console.log(tracks);
			rooster.buildPlaylist(tracks);
	});
}

const getRandomTrack = function(trackArray) {
	const randoNum = Math.floor(Math.random() * trackArray.length);
	return trackArray[randoNum]
}
const getFirstElement = (item) => item[0];
const flatten = (prev, curr) => [...prev,...curr];


rooster.buildPlaylist = function(tracks){
	// console.log(tracks, 'these are the tracks');

	$.when(...tracks)
	.then((...trackResults) => {
		trackResults = trackResults.map(getFirstElement)
		.map(item => item.items)
		.reduce(flatten, [])
		.map(item => item.id)
		// console.log(trackResults, 'these are flattened')
		const randomTracks = []
		for (let i = 0; i < 40; i++){
			randomTracks.push(getRandomTrack(trackResults));
		}
		console.log(randomTracks)
		// console.log(randomTracks, ' 40 list o rando tracks')
		const baseUrl = `https://embed.spotify.com/?theme=white&uri=spotify:trackset:Rooster mornings:${randomTracks.join(',')}`;
		$('.playlist').append(`
			<iframe src="${baseUrl}"></iframe>
			<div class="roosterPoem">
				<h2>Sounds of <span class="morningGenres"></span> have you chosen upon.</h2>
			<h2>Now 3 times midst your music shall I help you along,</h2>
			<h2>When you hear my song:</h2>
			<h2>“Get your brekkie gone!”</h2>
			<h2>“Get your clothing on!</h2>
			<h2>“Pack up all your belong!.....-ings</h2>
			<h2>And ski-daddle
			</h2>
			</div>
			<button>Click here and your timer shall start thereupon</button>
			`);

		$('.playlist').css('display', 'block');
		$('footer').css('display', 'none');
		let userGenresSep = rooster.userGenres.join('/');
		$('.morningGenres').html(`${userGenresSep}`);
		$('.wrapper').css('display', 'none');
		console.log(baseUrl);
		

//now I need to start a timer, which is displayed on the page, and triggers the rooster crow at user activity ends
		//
	});
};
rooster.setCountDown1 = function() {
	$('.playlist').on('click','button', function(e) {
			$('.counterDisplay').css('display','block');
			$('button').css('display','none')

			const countdownSeq = [{count:rooster.dressingPlayLengthMin, text: "minutes to get dressed and showered"}, {count:rooster.breakfastPlayLengthMin, text:"minutes to get fed and caffeinated"}, {count:rooster.packedPlayLengthMin, text:"minutes to get packed and out the door"}, {count: 1, text:"minute left!  Out you go!"}];
			//this changes the counter number
			const changeScreen = curr => {
			  document.getElementById('minutes').innerText = curr.count;
			  document.getElementById('minuteMessage').innerText = curr.text;
			}
			//this starts the countdown of all three intervals.  It runs each activity length in the countdownSeq array in order (it's argument).
			function startCountdown(countdownSeq) {
			  const interval = 1000;
			  //this is the speed at which they de-increment(can be changed to minutes when you want)
			  let currentActivityMins = countdownSeq.shift();
			  //this is what makes us run through each index of the countdownSeq array.
			//   if (currentActivityMins ===0){
			// 		document.getElementById('minutes').innerText = "";
			//   	document.getElementById('minuteMessage').innerText = "Out you go!  Have a great day!"; 
			// }
			//   if (currentActivityMins ===rooster.dressingPlayLengthMin){
			// 	document.getElementById('minuteMessage').innerText = "minutes to get dressed and showered";  
			// }
			// if (currentActivityMins ===rooster.breakfastPlayLengthMin){
			// 	document.getElementById('minuteMessage').innerText = "minutes to get fed and caffeinated";  
			// }
			// if (currentActivityMins ===rooster.packedPlayLengthMin){
			// 	document.getElementById('minuteMessage').innerText = "minutes to get packed and out the door";  
			// }
			  if (!currentActivityMins) return;
			  //this exits the function when array items are exhausted
			  const count = () => setTimeout(() => {
			  	// I think this starts each action by a falling second
			    changeScreen(currentActivityMins);
			    (currentActivityMins.count)--;
			    //this updates the screen with the counter running down
			    if (currentActivityMins.count === 0) {
			    	$('.counterDisplay').append(`<audio autoplay><source src="audio/Rooster-crowing-sound.mp3"></audio>`);
			    	//I think this should happen before the next activity starts?
			      startCountdown(countdownSeq);
			      //when it runs out, this starts the countdown with the next array item.  
			    } else {
			      count();
			      //this count keeps the loop calling itself til finished
			    }
			  }, interval);
			  count();
			  //this starts the countdown within each interval
			}
			startCountdown(countdownSeq);
			//this starts the group of three over all
		})
	}	
			// const countdownSeq = [rooster.dressingPlayLengthMin, rooster.breakfastPlayLengthMin, rooster.packedPlayLengthMin];
			// const changeScreen = function(number) {
			// 	$('#minutes').append = number
			// }
			// startCountdown  = function(countdownSeq){
			// 	const interval =1000;
			// 	let currentActivityTime = countdownSeq.shift();
			// 	if (!currentActivityTime) return;

			// 	const count = () => setTimeout(() => {
			// 		changeScreen(currentActivityTime);
			// 		currentActivityTime--;
			// 		if (currentActivityTime ===0) {
			// 			startCountdown(countdownSeq);
			// 		} else {
			// 			count()
			// 		}
			// 	}, interval);
			// 		count();
			// 	}
			// 	count();
			// })
			// startCountdown(countdownSeq);
			// }
			


			// var count = 0;
			// var countdowns = [countdownDressing, countdownBreakfast, countdownPacked];

			// intervalInitializer = window.setInterval(function() {
			// 	if (count < countdowns.length) {
			// 		window.setInterval(countdowns[count],6000);
			// 		count++;
			// 	} else{
			// 		clearInterval(intervalInitializer);
			// 	}
			// }, 6000)

			// let countdownDressing = window.setInterval(function(){
			// 	$('#minutes').html(rooster.dressingPlayLengthMin);
			// 	rooster.dressingPlayLengthMin--;
			// 	if (rooster.dressingPlayLengthMin === 0){
			// 		$('.counterDisplay').append(`<audio autoplay><source src="audio/Rooster-crowing-sound.mp3"></audio>`);
			// 		$('#minutes').html(rooster.breakfastPlayLength);
			// 		clearInterval(countdownDressing)
			// 	}
			// }, 1000);


			// let countdownBreakfast = window.setInterval(function(){
			// 	$('#minutes').html(rooster.breakfastPlayLengthMin - 1);
			// 	rooster.breakfastPlayLengthMin--;
			// 	if (rooster.breakfastPlayLengthMin === 1){
			// 		$('.counterDisplay').append(`<audio autoplay><source src="audio/Rooster-crowing-sound.mp3"></audio>`);
			// 		clearInterval(countdownBreakfast)
			// 		$('#minutes').html('');
			// 	}
			// }, 1000);
			// let countdownPacked = window.setInterval(function(){
			// 	$('#minutes').html(rooster.packedPlayLengthMin);
			// rooster.packedPlayLengthMin--;
			//  	if (rooster.packedPlayLengthMin === 1){
			// $('.counterDisplay').append(`<audio autoplay><source src="audio/Rooster-crowing-sound.mp3"></audio>`);
			// 	clearInterval(countdownPacked);
			// 		$('#minutes').html(0);
			// 	}
			// }, 1000);
			

//Esme  check here for brackets that used to work

// 		});
// }



rooster.init = function(){
	$.ajax({
		url: 'http://proxy.hackeryou.com',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		data: JSON.stringify({
			reqUrl: 'https://accounts.spotify.com/api/token',
			params: {
				grant_type: 'client_credentials'
			},
			proxyHeaders: {
				'Authorization': 'Basic MTY5Y2EwNGU1ODk5NGQwNWJhOWRmYzcxMjE5YzQ2NGQ6YmUwNWI1ZTc3NGE2NDVhMjllNWYzZjFiOTQyMDExMDI'
			}
		})
	})
	.then((data) => {
		headers = {
			'Authorization': `${data.token_type} ${data.access_token}`
		}
		rooster.events();
		rooster.setCountDown1(); 
	})
}

//initilize function to call the others when this is ready 

//Document ready
$(function(){
	rooster.init();
});

