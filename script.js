numeral.locale('vi');
const lang  = $('input[name="language"]').val();

const noteTypes     = [500, 200, 100, 50, 20, 10, 5, 2, 1];
const budgetTable   = [
    { 'parents':  100, 'grandparents':  100, 'spouse': 100, 'children':  100, 'siblings':  20, 'grandchildren':  10, 'lover':  20, 'friends':  5, 'colleagues':  5 },
    { 'parents':  200, 'grandparents':  150, 'spouse': 150, 'children':  150, 'siblings':  50, 'grandchildren':  20, 'lover':  50, 'friends':  8, 'colleagues':  8 },
    { 'parents':  300, 'grandparents':  200, 'spouse': 200, 'children':  200, 'siblings':  80, 'grandchildren':  30, 'lover':  80, 'friends':  10, 'colleagues':  10 },
    { 'parents':  500, 'grandparents':  300, 'spouse': 300, 'children':  300, 'siblings':  100, 'grandchildren':  40, 'lover':  100, 'friends':  20, 'colleagues':  20 },
    { 'parents':  800, 'grandparents':  500, 'spouse': 500, 'children':  500, 'siblings':  150, 'grandchildren':  50, 'lover':  150, 'friends':  30, 'colleagues':  30 },
    { 'parents':  1000, 'grandparents':  800, 'spouse': 800, 'children':  800, 'siblings':  200, 'grandchildren':  100, 'lover':  200, 'friends':  40, 'colleagues':  40 },
    { 'parents':  1500, 'grandparents':  1000, 'spouse': 1000, 'children':  1000, 'siblings':  300, 'grandchildren':  200, 'lover':  300, 'friends':  50, 'colleagues':  50 },
    { 'parents':  2000, 'grandparents':  1500, 'spouse': 1500, 'children':  1500, 'siblings':  500, 'grandchildren':  300, 'lover':  500, 'friends':  68, 'colleagues':  68 },
    { 'parents':  3000, 'grandparents':  2000, 'spouse': 2000, 'children':  2000, 'siblings':  800, 'grandchildren':  500, 'lover':  800, 'friends':  100, 'colleagues':  100 },
    { 'parents':  5000, 'grandparents':  3000, 'spouse': 3000, 'children':  3000, 'siblings':  1000, 'grandchildren':  800, 'lover':  1000, 'friends':  200, 'colleagues':  200 },
];

const budgetAdjustSequence = ['colleagues', 'friends', 'lover', 'grandchildren', 'siblings', 'children', 'spouse', 'grandparents', 'parents']


$('#btn-calculate').on('click', function () {
    const budget    = numeral($('input[name="budget"]').val()).value() || 0;
    $('.redpacket-calculator-factors .help-block').hide();

    const isInputBudgetValid = validateInputBudget();
    if (!isInputBudgetValid) return;

    const quantity  = {};
    const allNotes  = {};
    const amtType   = {};
    let amount;
    let budgetTableIndex;
    let isValid     = false;

    $('.budget-factor input').each(function () {
        const key   = $(this).attr('name');
        const val   = $(this).val() || 0;

        if (val > 0) isValid = true;

        quantity[key]   = parseInt(val);
    })

    if (!isValid) {
        $('.redpacket-calculator-factors .help-block').fadeIn();

        const redpacketFactorTop = $('.redpacket-calculator-factors').offset().top;
        $('html, body').animate({ scrollTop: redpacketFactorTop }, 200);

        return;
    }

    // validate budget
    for (var i = 0; i < budgetTable.length; i++) {
        amount              = budgetTable[i];
        budgetTableIndex    = i;

        if (calTotal(quantity, amount) >= budget) break;
    }

    if (calTotal(quantity, amount) > budget) {
        for (var i = 0; i < budgetAdjustSequence.length && budgetTableIndex > 0; i++) {
            const adjustKey     = budgetAdjustSequence[i];
            console.log(budgetTableIndex);
            amount[adjustKey]   = budgetTable[budgetTableIndex - 1][adjustKey];

            if (calTotal(quantity, amount) <= budget) break;
        }
    }

    Object.keys(amount).forEach(function (key) {
        if (!amtType[amount[key]] && amtType[amount[key]] !== 0) {
            amtType[amount[key]] = 0;
        }

        amtType[amount[key]] += parseInt(quantity[key]);
    });


    Object.keys(amtType).forEach(function (key) {
        const notes = calNotes(parseInt(key));

        Object.keys(notes).forEach(function (note) {
            if (!allNotes[note]) allNotes[note] = 0;

            allNotes[note] += notes[note] * amtType[key];
        })
    })

    displayNotes(allNotes);
    displayAmount(quantity, amount);

    $('input[name="suggest-budget"]')
        .val(numeral(calTotal(quantity, amount)).format('0,0'))
    $('.suggest-budget').fadeIn();
    $('.redpacket-calculator-result-note').fadeIn();

    $(this).hide();
    $('#btn-recalculate').fadeIn();

})


$('#btn-recalculate').on('click', function () {
    // $('.budget-factor input').val('');

    $('.budget-amount').hide();
    $('.budget-factor .controller').fadeIn();
    $('.redpacket-calculator-result').fadeOut();
    $('.suggest-budget').fadeOut();
    $('.redpacket-calculator-result-note').fadeOut();

    $(this).hide();
    $('#btn-calculate').fadeIn();
})


function displayAmount(quantity, amount) {
    $('.budget-amount img').attr('src', '');
    $('.budget-amount span').empty();


    Object.keys(amount).forEach(function (key) {
        if (!quantity[key]) return;

        const qty   = quantity[key];
        const amt   = amount[key];

        const $budgetAmount = $('#' + key).closest('.budget-factor').find('.budget-amount');

        if (qty === 1) {
            $budgetAmount.find('img').attr('src', './images/redpacket-1.png');
        } else {
            $budgetAmount.find('img').attr('src', './images/redpacket-2.png');
        }

        $budgetAmount.find('span').text(numeral(amt * 1000).format('0,0') + ' VND x ' + qty);
    })


    $('.budget-amount').fadeIn();
}


function displayNotes(notes) {
    $('.redpacket-amount-detail').empty();

    Object.keys(notes).forEach(function (note) {
        if (!notes[note]) return;

        const $div = $('<div/>', {
            class: 'col-sm-4',
        })

        const $divWrapper = $('<div/>', {
            style: 'padding: 10px 0',
        })

        const $icon = $('<img/>', {
            src: './images/dolla.png',
            style: 'width: 20px; margin-right: 10px; margin-top: -3px;',
        }).appendTo($divWrapper);

        let unit = 'tờ';
        if (lang === 'en') {
            unit = 'sheet';
        }

        const $span = $('<span/>', {
            html: numeral(parseInt(note) * 1000).format('0,0') + ' VND x ' + notes[note] + ' ' + unit,
        }).appendTo($divWrapper);

        $divWrapper.appendTo($div);

        $('.redpacket-amount-detail').prepend($div);
    });

    $('.budget-factor .controller').hide();
    $('.redpacket-calculator-result').fadeIn();
}


let prevBudget  = 0;

$('input[name="budget"]').on('change keydown keypress keyup mousedown click mouseup', function (e) {
    if (!$(this).val()) {
        $('.input-budget .help-block').fadeOut();
        $('.input-budget input[name="budget"]').removeClass('is-invalid');

        return;
    }

    const val   = numeral($(this).val()).value();

    if (isNaN(val) || !val || val < 0) {
        $('.input-budget input[name="budget"]').addClass('is-invalid');

        if (lang == 'en') {
            $('.input-budget .help-block').text('*Your budget is not valid');
            return;
        }

        $('.input-budget .help-block').text('*Số tiền chưa hợp lệ!').fadeIn();
        return;
    }

    $('.input-budget .help-block').fadeOut();
    $('.input-budget input[name="budget"]').removeClass('is-invalid');
    $(this).val(numeral(val).format('0,0'));
})


function validateInputBudget() {
    $('.input-budget .help-block').hide();
    $('.input-budget input[name="budget"]').removeClass('is-invalid');

    let isValid = true;

    if (!$('input[name="budget"]').val() && $('input[name="budget"]').val() !== 0) {
        $('.input-budget input[name="budget"]').addClass('is-invalid');
        isValid = false;

        if (lang == 'en') {
            $('.input-budget .help-block').text('*You haven\'t enter your budget').fadeIn();
        } else {
            $('.input-budget .help-block').text('*Bạn chưa nhập ngân sách!').fadeIn();
        }
    } else if (!budget || budget < 0) {
        $('.input-budget input[name="budget"]').addClass('is-invalid');
        isValid = false;

        if (lang == 'en') {
            $('.input-budget .help-block').text('*Your budget is not valid').fadeIn();
        } else {
            $('.input-budget .help-block').text('*Số tiền chưa hợp lệ!').fadeIn();
        }
    }

    if (!isValid) {
        $('html, body').animate({ scrollTop: $('.input-budget input[name="budget"]').offset().top - 40 }, 200);
    }

    return isValid;
}


$('.minus-one').on('click', function () {
    $input  = $(this).closest('.budget-factor').find('input[type="text"]');

    const curVal    = parseInt($input.val()) || 0;
    $input.val(curVal - 1 >= 0 ? curVal - 1 : 0);
})


$('.plus-one').on('click', function () {
    $input  = $(this).closest('.budget-factor').find('input[type="text"]');

    const curVal    = parseInt($input.val()) || 0;
    $input.val(curVal + 1);
})


function calTotal(qty, amt) {
    total = 0;

    Object.keys(qty).forEach(function (key) {
        total += qty[key] * (amt[key] * 1000);
    })

    return total;
}


function calNotes(amt) {
    const notes = {};
    let tmp     = amt;

    noteTypes.forEach(function (noteType) {
        if (!notes[noteType]) notes[noteType] = 0;
        notes[noteType] += Math.floor(tmp / noteType);
        tmp             = tmp % noteType;
    })

    return notes;
}
