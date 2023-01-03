function Validator(formElement){

    var _this = this

    function getParent(element,selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }


    var formRules = {};
    /**
     * Quy ước rules :
     * 1. nếu có lỗi thì trả về lỗi
     * 2. nếu không có lỗi thì return `undefined`
     */
    var validatorRules = {
        required: function(value){
            return value ? undefined :'vui long nhập trường này'
        },
        email: function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined :'vui lòng nhập Email'
        },
        min: function(min){
            return function(value){
                return value.length >= min ? undefined :`Vui long nhập ít nhất ${min} ký tự`
            }
        },
        max: function(max){
            return function(value){
                return value.length <= min ? undefined :`Vui long nhập nhiều nhất ${max} ký tự`
            }
        },
    }



    //lấy element trong Dom the form-selector
    var formElement = document.querySelector(formElement);
    if (formElement) {
        var inputs = document.querySelectorAll('[name][rules]'); 
        for(var input of inputs){

            var rules = input.getAttribute('rules').split('|');

            for(var rule of rules){

                var ruleInfo;
                var isRuleHasValue = rule.includes(':')

                if(isRuleHasValue){
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }
                var ruleFunc = validatorRules[rule]
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }
                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc)
                }else{
                    formRules[input.name] = [ruleFunc]
                }
            }

            // lắng nghe sự kiên để validate(blur, change, ....)

            input.onblur =  handleValidate;
            input.oninput =  handleClearError;
        }
        
        // thực hiện hàm validate
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;
            for(var rule of rules){
                errorMessage = rule(event.target.value)
                if(errorMessage) break;
                
            }

            // nếu cói lỗi thì xuất ra màn hình
            if(errorMessage){
                // console.log(event.target);
                var formGroup = getParent(event.target,".form-group")
                // console.log(formGroup);
                if(formGroup){
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message');
                    if(formMessage){
                        formMessage.innerText = errorMessage;                        
                    }
                }
            }
            return !errorMessage;
        }
        // hàm clear message lỗi khi người dùng bất đầu nhập
        function handleClearError(event){
            var formGroup = getParent(event.target,".form-group")
            if(formGroup.classList.contains('invalid')){
                formGroup.classList.remove('invalid')
                var formMessage = formGroup.querySelector('.form-message');
                if(formMessage){
                    formMessage.innerText = '';                        
                } 
            }
        }
    }


    // Xử lý sự kiện onsubmit
    formElement.onsubmit = function (event) {
        event.preventDefault();

        var inputs = document.querySelectorAll('[name][rules]');
        // console.log(_this);
        var isValid = true;
        for(var input of inputs){
        
            if(!handleValidate( {target:input,} )){
                isValid = false
            }

        }
        // console.log(isValid);
        // khi không có lỗi thì submit form

        if(isValid){
            if (typeof _this.onSubmit === 'function') {

                var enableInputs = formElement.querySelectorAll('[name]:not([disable])');
                var formValues = Array.from(enableInputs).reduce(function (values,input) {
                    switch(input.type){
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="'+ input.name + '"]:checked').value
                            break
                        case 'checkbox':
                            if(!input.matches(':checked')){
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

                _this.onSubmit(formValues);
            }else{
                formElement.submit();
            }
        }
    }
}