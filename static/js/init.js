function show(num) {
    $('#result_number').text(num);
    $('#result').show();
    $('#number').hide();
}

$('#close').click(function() {
    $('#result').hide();
    $('#number').show();
    console.log("close");
});
