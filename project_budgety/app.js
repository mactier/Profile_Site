/* 
Notes for Chapter 6

- using module pattern to keep pieces of code inside seperate indipendant modules
- use of private and public methods (data encapsulation hiding the inside scope from the outside scope [ie. create an api])
- module pattern
*/

/*
module for budget controller 
private IIFE
ensure we are not able to access a private function by typing the variable (x) into a browser console

'budgetController' is a private function which cannot be called externally. 
*/
var budgetController = (function() {

    var Expenses = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expenses.prototype.calculatePercentages = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expenses.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    /*
    calculate total which is a private function that would only be used internatl of this method.  
    */
    var calculateTotal = function(type) {
        /*
         all of the itemas are stored in the AllItems Object
         Get the array and loop through it to add all the values togehter. 
        */
        var sum = 0;
        // forEach accepts a callback funciton
        if (data.allItems[type].length > 0) {
            data.allItems[type].forEach(function(cur) {
                // value is the name we gave it in the income and expence functions above.
                sum = sum + cur.value;
                // we can story the sum total in the data scruture
                data.totals[type] = sum;
            });
        } else {
            data.totals[type] = 0
        }
    };

    /*
        Agregate all the data into one big data structure
    */
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    /*
    Create a public method to allow other functions add data into the data structure
    */
    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            /*
            creating an ID entry for an array
            ie. ID = last ID + 1
            If array is empty then new id should be 0
            */
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            /*
            Create new ite then recreate newItem based on inc or exp type
            */
            if (type === 'exp') {
                newItem = new Expenses(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            /*
            push to data structure
            */
            data.allItems[type].push(newItem);

            /*
            return new element
            */
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                /*
               map return an new array
                */

                return current.id;
            });

            index = ids.indexOf(id);

            /*
            we only want to delete an index if it the array contains an element using Splice
            */
            if (index !== -1) {
                /*
                start removing elements from the index and remove only 1 element
                */
                data.allItems[type].splice(index, 1);
            }
        },

        /*
        public method to calculate the budget.

        Called to calculate the dubget function, but also to calculate the sum of all incomes and expences, and the percentage of the income that we have spent. 
        */
        calculateBudget: function() {
            /* 
            calculate total income and expences
            create a private internal funciton called calculateTotal
            this is to be stored in the global data structure.
            */
            calculateTotal('exp');
            calculateTotal('inc');

            /*
            calculate the budget: income - expences
            */
            data.budget = data.totals.inc - data.totals.exp;


            /*
            calcualte the percentage of the incomes that we spent.  
            */
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calculatePercentages(data.totals.inc);
            });
        },

        getPercentage: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage(data.totals.inc);
            });
            return allPerc;
        },

        getBudget: function() {
            /*
            use an object to return multiple values at the same time
            */
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },

        // to test in the console
        testing: function() {
            console.log(data);
        },
    }

})();


/*
UI Controller:
*/
var UIController = (function() {
    var DOMstrings = {
        /*
        These are class elements from the HTML code. 
        */
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expencesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var formatNumber = function(num, type) {
        num = Math.abs(num);
        num = num.toFixed(2);

        var numSplit = num.split('.');
        var int = numSplit[0];
        var dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                /*
                this reads in a string and not a number, we need to convert this to a number to be able to use it. to do this we can use parseFloat to change it from a String to a Float integer
                */
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };

        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            /*
            create html string with placeholder tag
            */
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div> '
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div> '
            }

            /*
            replace the placeholder tag with data

            useing replate method
            html.replace(<placeholder string>, <what we will replace into it>);
            */
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            /*
            insert the html into the DOM
            */
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        /*
        DOM manupulation to remove an element. 
        first we need to go to the element we want to delete, then go to the partent of that element. 
        Then we can remove the child element. 

        We can only remove shild elements, not the element we are on or parent element. 
        */
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);

            el.parentNode.removeChild(el)
        },

        clearFields: function() {
            var fields, fieldsArray;
            /*
            querySelectorAll returns a list that we need to convert to an array. Use Slice to return a copy of the array thats called. If we pass a list into this it will still return an array
            */
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            /*
            We need to use the call method that will allow us to use the this method. 
            Array is the function constructor for ALL arrays.

            This will trick the array method into thining we are calling an array which will then convert the list to an array
            */
            fieldsArray = Array.prototype.slice.call(fields);

            /*
            This function call is a callback function and can accept 3 argument
            */
            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            });
            /*
            This will allow the focus to return back to the first field after all are cleared when the entry is made.
            */
            fieldsArray[0].focus();
        },

        /*
        was pass in obj which is an object that will contain all the data to print to the screen, inc, exp, budget, percentage

        we need to know the calss names in the UI to perform the DOM manipulation
        */
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(
                DOMstrings.budgetLabel
            ).textContent = formatNumber(obj.budget, type);

            document.querySelector(
                DOMstrings.incomeLabel
            ).textContent = formatNumber(obj.totalInc, 'inc');

            document.querySelector(
                DOMstrings.expensesLabel
            ).textContent = formatNumber(obj.totalExp, 'exp');


            if (obj.percentage > 0) {
                document.querySelector(
                    DOMstrings.percentageLabel
                ).textContent = obj.percentage + '%';
            } else {
                document.querySelector(
                    DOMstrings.percentageLabel
                ).textContent = '--';
            }
        },

        displayPercentages: function(percentages) {
            var field = document.querySelectorAll(DOMstrings.expencesPercentageLabel);
            this.displayMonth();

            nodeListForEach(field, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth();
            var realMonth = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ];
            var date = now.getDate();

            document.querySelector(
                DOMstrings.dateLabel
            ).textContent = realMonth[month] + ' ' + date + ', ' + year;
        },

        /*
        Change the field outline colour to red if it is an expense
        */
        changeType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        /*
        Making the DOM strings publicly accessable
        */
        getDOMstrings: function() {
            return DOMstrings;
        }
    }
})();

/*
Global controller now knows of the other 2 controllers since they are passed into the add controller, and can now use both the budget and ui controllers. 
*/
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListener = function() {

        var DOM = UICtrl.getDOMstrings();

        // Listening for a click action on the add button (tick mark)
        document.querySelector(DOM.inputBtn).addEventListener('click', function() {
            crtlAddItem();
        });
        // listener to listen for a key press (enter)
        document.addEventListener('keypress', function(event) {
            if (event.key === "Enter" || event.which === 13) {
                crtlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UIController.changeType);
    };

    var updateBudget = function() {
        // 4. Calculate the budget by creating a piublic method in the budget controller
        budgetCtrl.calculateBudget();

        // 4.1. update the budget
        var budget = budgetCtrl.getBudget();

        // 5. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // calculate percentages
        budgetCtrl.calculatePercentages();
        // read from budget controller
        var percentages = budgetCtrl.getPercentage();
        // update the UI
        UICtrl.displayPercentages(percentages);
    };

    // custom funfction to add to the list
    var crtlAddItem = function() {
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getinput();
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 3.1. clar the fields
            UIController.clearFields();

            // 4 and 5 now in 'updateBudget' 
            // calculate and update budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        /*
        This is nt the best option since the dom structure has now been hardcoded
        */
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            console.log(itemID)
                /*
                '-' is the split point
                */
            splitID = itemID.split('-');
            type = splitID[0];
            /*
            the ID is a string so we need to convert it to an integer using parseInt
            */
            ID = parseInt(splitID[1]);

            // 1. delete the irem from the datastructure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }

    };

    // create a public init function
    return {
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0,
            });
            setupEventListener();
        }
    };



})(budgetController, UIController);

/*
How to read data from different HTML input types
*/






// initalize the application
controller.init();
