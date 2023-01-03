// validator Form

// hàm validator 
function Validator(options) {

    function getParent(element,selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {}
    // hàm thực thi validate
    function validate(inputElement,rule){
        
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage

        var rules = selectorRules[rule.selector]
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':          
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector+ ':checked')
                    );
                    break;
            
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            
            if(errorMessage)break;
        }

        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid');
        }else{
            errorElement.innerText = '';
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
        }
        return !errorMessage
    }

    

    var formElement = document.querySelector(options.form)
    if(formElement){

        // thực hiện validate tất cả dữ liệu(thực hiện onsubmit)
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector);
               
                var isValid = validate(inputElement,rule);
                if(!isValid){
                    isFormValid = false;
                }   
            });
            // console.log(formValues);
            // trường hợp submit with js
            if(isFormValid){
                if(typeof options.onsubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disable])');
                    var formValues = Array.from(enableInputs).reduce(function (values,input) {
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="'+ input.name + '"]:checked').value
                                break
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    // values[input.name] = '';
                                    return values
                                }
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break
                            default:
                                (values[input.name] = input.value);
                        }

                        return values;
                    },{});
                    options.onsubmit(formValues)
                }// submit with hành vi mặt định trình duyệt
                else{
                    formElement.submit();
                }
            }
            


        }

        // lặp qua mỗi rule và xữ lý
        options.rules.forEach((rule) => {
            var inputElements = formElement.querySelectorAll(rule.selector)

            // Lưu lại các rule
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector] = [rule.test]
            }

            Array.from(inputElements).forEach(function(inputElement){
                // xữ lý blur
                inputElement.onblur = function(){
                    validate(inputElement,rule)  
                }

                // xử lý trường hợp người dùng bắt đầu nhập
                inputElement.oninput = function(){
                    var errorElement =  getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
                }
            })

        });
    }
}

// định nghĩa các rule
// nguyên tắt chung của rule
/**
 * 1. khi có lỗi trả ra mess lỗi
 * 2. khi hợp lệ thì không làm bất cứ thứ gì
 */
Validator.isRequired = function (selector,message) {
    return {
        selector:selector,
        test: function (value){
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    };
}

Validator.isEmail = function (selector,message) {
    return {
        selector:selector,
        test: function (value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Email không chính xác"
        }
    };
}

Validator.minLength = function (selector,min,message) {
    return {
        selector:selector,
        test: function (value){
            
            return value.length >= min ? undefined : `Vui lòng nhập đủ ${min} ký tự`
        }
    };
}
Validator.isConfirmed = function (selector,getConfirmValue,message) {
    return {
        selector:selector,
        test: function (value){
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    };
}

Validator.isName = function (selector,isNumber,message) {
    return {
        selector:selector,
        test: function(value){
            
        }
    }
}