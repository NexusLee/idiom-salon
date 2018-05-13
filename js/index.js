$(function(){
    "use strict";

    var dappAddress = "n1ewcW41BNjNST7D3CDBrrXSaFNTgvm5Pc9";
    var nebulas = require("nebulas"),
        Account = nebulas.Account,
        neb = new nebulas.Neb();
    neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));

    var NebPay = require("nebpay");
    var nebPay = new NebPay();

    var list = document.querySelector("#list");
    var submit = document.querySelector("#submit");
    var idiom = document.querySelector("#idiom");

    var serialNumber, intervalQuery, lastWord, len = 0;

    submit.addEventListener("click", function (e){
        var pattern = /^[\u4E00-\u9FA5]{1,4}$/;
        if (!pattern.test(idiom.value)) {
            alert("不是汉字或长度超出");
            return false;
        }

        if(len > 0) {
            var headText = idiom.value.substring(0, 1);
            if (headText !== lastWord) {
                alert("必须以上一个成语字尾为字头开始的成语");
                return false;
            }
        }

        var to = dappAddress;
        var value = "0";
        var callFunction = "save";
        var callArgs = "[\"" + idiom.value + "\"]";

        serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: function(resp){
                console.log(resp)
            }        //设置listener, 处理交易返回信息
        });

        intervalQuery = setInterval(function () {
            funcIntervalQuery();
        }, 5000);
    });

    function funcIntervalQuery() {
        nebPay.queryPayInfo(serialNumber)   //search transaction result from server (result upload to server by app)
            .then(function (resp) {
                var respObject = JSON.parse(resp);
                if(respObject.code === 0){
                    clearInterval(intervalQuery);
                    var html = '<div class="weui-cell">'+
                        '<div class="weui-cell__bd">'+
                        '<p>' + idiom.value + '</p>'+
                        '</div>'+
                        '<div class="weui-cell__ft">' + respObject.data.from + '</div>'+
                        '</div>';
                    list.innerHTML += html;
                    lastWord = idiom.value.substring(idiom.value.length - 1, idiom.value.length);
                }
            })
            .catch(function (err) {
                console.log(err);
            });
    }


    var $loadingToast = $('#loadingToast');
    if ($loadingToast.css('display') != 'none') return;
    $loadingToast.fadeIn(100);

    //初始化
    function init() {
        var from = Account.NewAccount().getAddressString();
        var value = "0";
        var nonce = "0";
        var gas_price = "1000000";
        var gas_limit = "2000000";
        var callFunction = "get";
        var callArgs;
        var contract = {
            "function": callFunction,
            "args": callArgs
        };
        neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
            var html = "";
            var result = JSON.parse(resp.result);
            len = result.records.length;
            lastWord = result.lastWord === undefined ? '' : result.lastWord;
            result.records.map(function(item, index){
                html += '<div class="weui-cell">'+
                    '<div class="weui-cell__bd">'+
                    '<p>' + item.value + '</p>'+
                    '</div>'+
                    '<div class="weui-cell__ft">' + item.author + '</div>'+
                    '</div>';
            });
            $loadingToast.fadeOut(100);
            list.innerHTML += html;

        }).catch(function (err) {
            console.log("error:" + err.message)
        })
    }

    init();
});




