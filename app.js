// BUDGET CONTROLLER
var budgetController = (function () {
    // FUNCTION CONSTRUCTOR
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems : {
            exp : [],
            imc : []
        },
        totals : {
            exp : 0,
            inc : 0
        }
    };


    return {
        addItem : function (type, des, val) {
            var newItem,ID;
            // [1 2 3 4 5], NEXTID = 6;
            // [1 2 4 6 8], NEXTID = 9;
            // ID = lastId - 1;
            // create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                ID = 0;
            }
            // create new items based on the 'inc' or 'exp'type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            // push it into our data structure 
            data.allItems[type].push(newItem);
            // return the new element
            return newItem;
        },
        testing : function () {
            console.log(data);
        }
    };



}) ();

// UI CONTROLLER
var UIController = (function () {

    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list'
    }
    return {
        getInput : function () {

            return {
                type : document.querySelector(DOMStrings.inputType).value,  // will be either inc or exp
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : document.querySelector(DOMStrings.inputValue).value
            };    
        },
        addListItem : function (obj, type) {
            var html, newHtml, element;
            // create html string with placeholder text 
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
            }
            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            // insert the html into the DOM 
            document.querySelector(element).insertAdjacentElement('beforeend', newHtml);
        },
        getDOMStrings : function()  {
            return DOMStrings;
        }
    };
}) ();




 // GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keycode === 13  || event.which === 13) {
                ctrlAddItem();
            }
        });
    };


    var ctrlAddItem = function() {
        var input,newItem;
        // 1. GET THE FILLED INPUT DATA
        input = UICtrl.getInput();
        // 2. ADD THE ITEM TO THE BUDGET CONTROLLER
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // 3. ADD THE NEW ITEM TO THE UI
        UICtrl.addListItem(newItem, input.type);
        // 4. CALCULATE THE BUDGET

        // 5. DISPLAY THE BUDGET ON THE UI

    };

    return {
        init : function () {
            console.log('applications has started'); 
            setupEventListeners();
        }
    };


}) (budgetController, UIController);

controller.init ();