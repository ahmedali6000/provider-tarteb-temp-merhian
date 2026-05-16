const ruleValidatorMapper = {
    isPhone: validPhone,
    minChars: minMumChars
};


function minMumChars(userInput,{num}){
    // if(userInput.length === num){
    //     return true;
    // }else{
    //     return false;
    // }
    return userInput.length === num;
}
function validPhone(userInput){
    // 11 Digits
    // if(userInput.length !== 11){
    //     return false;
    // }
    // check that every digit is num
    // return Array.from(enteredPhone).every( char => char >= 0 && char <= 9 );
    //lets use regular expression stratigy.
    return /^[0-9]+$/.test(userInput); 
}

export function validate(user_input,rules)
{
    let isValid = true;
    for(let rule of rules){
        isValid = isValid && ruleValidatorMapper[rule.key](user_input,rule)    
    }
    return isValid;
}