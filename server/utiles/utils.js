const moment = require('moment');

class Utiles {

    formatoES(number) {
        const exp = /(\d)(?=(\d{3})+(?!\d))/g;
        const rep = '$1.';
        return number.toString().replace(exp,rep);
    }
    
    compareOffers( offer1, offer2 ) {        
        if (moment(offer1.dateOfOffer).isAfter(offer2.dateOfOffer)){
          return -1;
        }
        if (moment(offer1.dateOfOffer).isBefore(offer2.dateOfOffer)){
          return 1;
        }
        return 0;
    }
    compareOffersByAmount( offer1, offer2 ) {        
        if (offer1.offerAmount > offer2.offerAmount){
          return -1;
        }
        if (offer1.offerAmount < offer2.offerAmount){
          return 1;
        }
        return 0;
    }



    getRandom(arr, n) {
      var result = new Array(n),
          len = arr.length,
          taken = new Array(len);
      if (n > len)
          throw new RangeError("getRandom: more elements taken than available");
      while (n--) {
          var x = Math.floor(Math.random() * len);
          result[n] = arr[x in taken ? taken[x] : x];
          taken[x] = --len in taken ? taken[len] : len;
      }
      return result;
  }

  getRandomSpecial(array, n){
    var result = [],
      len = array.length
      taken = [];
  }

}
module.exports = new Utiles();