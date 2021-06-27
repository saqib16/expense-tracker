const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

let listtransactions = [];

// Add transaction
function addTransaction(e) {
  e.preventDefault();

  var eleCheck = document.getElementsByName('record_trans');
  var selectedIndex = -1 ;           
  for(i = 0; i < eleCheck.length; i++) {
      if(eleCheck[i].checked)
          selectedIndex = i;
  }

  if (text.value.trim() === '' || amount.value.trim() === '' || selectedIndex <0 ) {
    alert('Please add description and amount and select expense/income .');
  } else {
    const transaction = {
      desc: text.value,
      amount: +amount.value,
      tranType : eleCheck[selectedIndex].value
    };

    recordTransaction(transaction.desc, transaction.amount, transaction.tranType);

    text.value = '';
    amount.value = '';
    eleCheck[selectedIndex].checked = false;
  }
}

// Add transactions to DOM list
function addTransactionDOM(_transaction) {
  // Get sign
  listtransactions.push(_transaction);
  const sign = _transaction.tranType == "exp" ? '-' : '+';

  const item = document.createElement('li');

  // Add class based on value
  item.classList.add(_transaction.tranType == "exp" ? 'minus' : 'plus');

  item.innerHTML = `
    ${_transaction.desc} <span>${sign}${Math.abs(
      _transaction.amount
  )}</span>
  `;

  list.appendChild(item);
}

// Update the balance, income and expense
function updateValues() {

    const income = listtransactions
    .filter(item => item.tranType == "inc")
    .reduce((acci, item) => (acci += parseInt(item.amount)), 0);
    //.toFixed(2);

    const expense = listtransactions
    .filter(item => item.tranType == "exp")
    .reduce((acc, item) => (acc += parseInt(item.amount)), 0);
    //.toFixed(2);

  balance.innerText = `$${Math.abs(income-expense)}`;
  money_plus.innerText = `$${Math.abs(income)}`;
  money_minus.innerText = `$${Math.abs(expense)}`;
}

    var expIncomeContract;
    var userAccount;

    const init = async() => {

      const id = await web3js.eth.net.getId();
      const deployedNetwork = MyContract.networks[id];
      expIncomeContract = new web3js.eth.Contract(
        MyContract.abi,
        deployedNetwork.address
      );

      const addresses = await web3js.eth.getAccounts();
      userAccount = addresses[2];
      // var expTrackrAddress = "CONTRACT_ADDRESS";
      // expIncomeContract = new web3js.eth.Contract(expTrackrABI, expTrackrAddress);

     // var accountInterval = setTimeout(function () {

        // if (web3js.eth.accounts[0] !== userAccount) {
        //   userAccount = web3js.eth.accounts[0];

         getTransactionByOwner(userAccount)
           .then(displayTransactions);
        //}
    //  }, 100);

      // expIncomeContract.events.Newtransaction({})
      //   .on("data", function (event) {
      //     let data = event.returnValues;
      //     getTransactionByOwner(userAccount).then(displayTransactions);
      //   }).on("error", console.error);
    }

    function displayTransactions(ids) {
      list.innerHTML = '';
      for (id of ids) {

        getTransactionDetails(id)
          .then(function (tran) {


            addTransactionDOM(tran);
            updateValues();
          });
            
      }

    }

    function recordTransaction(_desc, _amount, _tranType) {

      listtransactions = [];
      $("#txStatus").text("Creating new transaction on the blockchain. This may take a while...");

      return expIncomeContract.methods.recordTransaction(_desc, _amount, _tranType)
        .send({ from: userAccount, gas : 1000000 })
        .on("receipt", function (receipt) {
          $("#txStatus").text("Successfully created " + _desc + "!");

          getTransactionByOwner(userAccount).then(displayTransactions);
        })
        .on("error", function (error) {

          $("#txStatus").text(error);
        });
    }

    function getTransactionDetails(id) {
      return expIncomeContract.methods.listTransactions(id).call()
    }


    function getTransactionByOwner(owner) {
      return expIncomeContract.methods.getTransactionByOwner(owner).call()
    }



    window.addEventListener('load', function () {


      if (typeof Web3 !== 'undefined') {

        //web3js = new Web3(web3.currentProvider);
        web3js = new Web3("http://localhost:8545");
       
        
      } else {


      }


      init();

    })


form.addEventListener('submit', addTransaction);
