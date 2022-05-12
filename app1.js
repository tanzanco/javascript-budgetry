// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentages = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    /*
     0
     [200, 400, 600]
     sum = 0 + 200
     sum = 200 + 400
     sum = 600 + 600 
     */

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp:0,
            inc:0
        },
        budget:0,
        percentage : -1,
    };

    return {
        addItem: function(type, des, val){
            var newItem,ID;

            // [1,2,3,4,5], next id = 6
            // [1 2 4 6 8], next id = 9
            // ID = last ID + 1

            // create new id
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }else {
                ID = 0;
            }

            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            // push it into our new data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem

        },
        deleteItem : function (type, id) {
            var ids, index;

            // id = 6
            // data.allItems[type][id];
            // ids = [1 2 4 6 8], next id = 9
            // index = 3;

            ids = data.allItems[type].map( function (current){
                return current.id;
            });
            index = ids.indexOf(id);
 
            if (index !== -1) {
                data.allItems[type].splice(index,1);
            }


        },
        calculateBudget: function(){
            // calculate total incomes and expenses 
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate budget : 'inc' - 'exp'
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income we spent
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else{
                data.percentage = -1;
            }

            // expense = 200 and income = 400, spent = 50% = 400/200 = 0.5 * 100
        },
        calculatePercentages : function () {
            data.allItems.exp.forEach(function (cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            var allPerc = data.allItems.exp.map( function (cur) {
                return cur.getPercentages();
            });
            return allPerc;
        },

        getBudget : function () {
            return {
                budget : data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing : function(){
            console.log(data);
        }
    };

}) ();



// UI CONTROLLER
var UIController = (function() {
    var DOMstrings = {
        inputType : '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLable : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPercLabel : '.item__percentage',
        dateLabel : '.budget__title--month',
    };
    var formatNumber = function(num, type){
        var numSplit,int,dec,type;
        /*
         + or - before the numbers
         exactly 2 decimals points
         comma separating the numbers

         2310.4587 -> + 2,310.46
         2000  ->  2,000.00
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }
        dec = numSplit[1];

        

        return (type === 'exp' ? '-' : '+')  + ' ' + int + '.' + dec;

    };

    var nodeListforEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback (list[i], i); 
        }
    };

    return{
        getinput : function () {
            return{
                type: document.querySelector(DOMstrings.inputType).value, // will be either 'inc' or 'exp'
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html,newHtml,element;

            // Create HTML string using placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer; 

                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp') {
                element = DOMstrings.expensesContainer; 

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // replace the placeholder with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber( obj.value, type));
            // Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem : function (selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields,fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,  type);
            document.querySelector(DOMstrings.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---' ;
            }
        },
        displayPercentages : function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListforEach(fields, function(current,index) {
                // do some stuff
                if(percentages[index] > 0){
                    current.textContent =  percentages[index] + '%';
                }else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth : function () {
            var now, month, months, year;

            now = new Date();

            months = ['january', 'february', 'march', 'april', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType : function () {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' 
                + DOMstrings.inputDescription + ','
                + DOMstrings.inputValue
            );

            nodeListforEach (fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();




// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl,UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if (event.keycode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {
        // 1.calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {

        // 1. calculate the percentages
        budgetCtrl.calculatePercentages();
        // 2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. update the user interface with the new percentages 
        UICtrl.displayPercentages(percentages);

    };
    var ctrlAddItem = function () {
        var input,newItem;
        // 1. get the filed input data
        input = UICtrl.getinput();

        if (input.description !== "" && !isNaN(input.value && input.value > 0)){
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. clear the fields
            UICtrl.clearFields();
            // 5. calculate and update the budget
            updateBudget();
            // 6. calculate and update the percentages
            updatePercentages();
        }
        
    };
    var ctrlDeleteItem = function (event) {
        var itemId,splitId,type,ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            // inc-1
            splitId = itemId.split('-');
            type = splitId[0];
            ID =parseInt(splitId[1]);

            // 1. delete the item from data structure
            budgetCtrl.deleteItem(type,ID);
            // 2. dalete the item from the ui
            UICtrl.deleteListItem(itemId);
            // 3. update and show new budget
            updateBudget();
            // 4. calculate and update the percentages
            updatePercentages();
        }
    };
    return{
        init : function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget : 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();

        }
    };
})(budgetController,UIController);

controller.init();