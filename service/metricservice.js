var bcservice=require('./bcservice.js')
var sql=require('../db/mysqlservice.js')
var co=require('co')
var helper = require('../app/helper.js');
var logger = helper.getLogger('metricservice');

//==========================query counts ==========================
function getChaincodeCount(channelName){
    return sql.getRowsBySQlCase(`select count(1) c from chaincodes where channelname='${channelName}' `)
}

function getTxCount(channelName){
    return sql.getRowsBySQlCase(`select count(1) c from transaction where channelname='${channelName}'`)
}

function getBlockCount(channelName){
    return sql.getRowsBySQlCase(`select max(blocknum) c from blocks where channelname='${channelName}'`)
}

function getPeerCount(){
    return bcservice.getallPeers().length
}

function* getTxPerChaincodeGenerate(channelName){
    let txArray=[]
    var c = yield sql.getRowsBySQlNoCondtion(`select c.channelname as channelname,c.name as chaincodename,c.version as version,c.path as path ,txcount  as c from chaincodes c where  c.channelname='${channelName}' `);
    c.forEach((item,index)=>{
        txArray.push({'channelName':item.channelname,'chaincodename':item.chaincodename,'path':item.path,'version':item.version,'txCount':item.c})
    })
    return txArray

}

function getTxPerChaincode(channelName,cb) {
    co(getTxPerChaincodeGenerate,channelName).then(txArray=>{
        cb(txArray)
    }).catch(err=>{
        logger.error(err)
        cb([])
    })
}

function* getStatusGenerate(channelName){
    var chaincodeCount=yield  getChaincodeCount(channelName)
    var txCount=yield  getTxCount(channelName)
    var blockCount=yield  getBlockCount(channelName)
    blockCount.c=blockCount.c ? blockCount.c: 0
    var peerCount=  getPeerCount(channelName)
    return {'chaincodeCount':chaincodeCount.c,'txCount':txCount.c,'latestBlock':blockCount.c,'peerCount':peerCount}
}

function getStatus(channelName ,cb){
    co(getStatusGenerate,channelName).then(data=>{
        cb(data)
    }).catch(err=>{
        logger.error(err)
    })
}

/*
getStatus('mychannel',function (data) {
    console.info(data)
})
*/

/*getTxPerChaincode('mychannel',function (data) {
    console.info(data)
})*/

exports.getStatus=getStatus
exports.getTxPerChaincode=getTxPerChaincode
