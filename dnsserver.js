const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const dns = require('dns');
const fs = require('fs');

const logoutput = fs.createWriteStream("./LOG/LOG_" + JSON.stringify(new Date()).replace(/[^0-9T]/g, "") + ".json");

now = function(){return new Date().getTime();}

console.leg = process.stdout.write;
/* File: DNS\DNS_SRV_Daemon.js */

//	/**********************************************************************************************************************\
//	* LOAD and SAVE System                                                                                                 *
//	* LOAD fires when start this *.js                                                                                      *
//	* SAVE fires when CTROL + Z or S is pressed                                                                            *
//	* SAVE and QUIT fires when CTROL + C is pressed                                                                        *
//	\**********************************************************************************************************************/
var DNS_SRV;
try {
	DNS_SRV = JSON.parse(fs.readFileSync('./DNS_Queries.json', {encoding: 'utf8'}));
} catch (e) {
	DNS_SRV = new Object();
}
process.stdin.setRawMode(true);
process.stdin.on('data', function (key) {
	console.log("Keypress:" + JSON.stringify(key));
	for(var a=0;a<key.length;a++){
		if (key[a] == 3) {	// Ctrol + C
			console.log("Gracefully stop server");
			server.close();
			fs.writeFileSync('./DNS_Queries.json', JSON.stringify(DNS_SRV, null, '\t'), {encoding: 'utf8'});
			process.stdin.setRawMode(false);
			process.exit();
		}
		if (key[a] == 26 || key[a] == 19) { // Ctrol + Z
			fs.writeFileSync('./DNS_Queries.json', JSON.stringify(DNS_SRV, null, '\t'), {encoding: 'utf8'});
			console.log("'DNS_Queries.json' Saved!");
		}
	}
});
//	/**********************************************************************************************************************\
//	* local storage for previous queries                                                                                   *
//	*                                                                                                                      *
//	*                                                                                                                      *
//	\**********************************************************************************************************************/
if (!DNS_SRV.CACHE)
	DNS_SRV.CACHE = new Object();

function GetDNameObject(Dname) {
	var DnameTree = Dname.split(".").reverse();
	var cachelevel = DNS_SRV.CACHE;
	for (var a = 1; a < DnameTree.length; a++)
		if(!cachelevel[DnameTree[a]])
			cachelevel = cachelevel[DnameTree[a]] = new Object();
		else
			cachelevel = cachelevel[DnameTree[a]];
	return cachelevel;
}

//	/**********************************************************************************************************************\
//	* DNS Server Listener                                                                                                  *
//	* no need for introductions                                                                                            *
//	* https://nodejs.org/api/dgram.html#dgram_socket_send_msg_offset_length_port_address_callback                          *
//	\**********************************************************************************************************************/

var PORT = 53;
var HOST = '127.0.0.1';


server.on('listening', function () {
	var address = server.address();
	console.log('UDP Server listening on ' + address.address + ":" + address.port);
});


lastquery = {};

server.on('message', function (message, remote) {
	//	message[]
	var messager = new Buffer(message);
	try {
		//		console.log(message);
		messager[2] += 0x80; // set response mode
		messager[3] += 0x0A; // set response code 0,1,2,3,4,5,9,10
		server.send(message, remote.port, remote.address);
		//		console.log(messager);
		//im lazy fuck you
	} catch (e) {
		console.log(e);
	}
	//The Real Deal
	var client = new UDPTemporarynamething(message, function (response) {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			console.log("\n" + JSON.stringify(new Date()).replace(/[^0-9T]/g, "") + "  " + JSON.stringify(remote));
			console.log("1>" + message.toString('hex'));
			console.log("2>" + messager.toString('hex'));
			console.log("3>" + response.toString('hex'));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

			//server.send(response, remote.port, remote.address);

			var DNS_Packet_IN = Buffer2DnsQuery(message);
			var DNS_Packet_OUT = Buffer2DnsQuery(response);

			var NamethisObj = GetDNameObject(DNS_Packet_IN.question[0].data)["|"];
			if (!NamethisObj)
				NamethisObj = new Object([]);

			console.log("Header_IN: \t" + JSON.stringify(DNS_Packet_IN.header));
			console.log("Header_OUT:\t" + JSON.stringify(DNS_Packet_OUT.header));
			console.log("Question_IN: \t" + JSON.stringify(DNS_Packet_IN.question));
			console.log("Question_OUT: \t" + JSON.stringify(DNS_Packet_OUT.question));
			console.log("Answers_IN:   ");
			DNS_Packet_IN.answer.forEach((a) => {console.log("\t\t" + JSON.stringify(a));})
			console.log("Answers_OUT:  ");
			DNS_Packet_OUT.answer.forEach((a) => {console.log("\t\t" + JSON.stringify(a));})
			console.log("NameSpace_IN: ");
			DNS_Packet_IN.namespace.forEach((a) => {console.log("\t\t" + JSON.stringify(a));})
			console.log("NameSpace_OUT:");
			DNS_Packet_OUT.namespace.forEach((a) => {console.log("\t\t" + JSON.stringify(a));})
			console.log("Extra_IN:    " + DNS_Packet_IN.extraData);
			console.log("Extra_OUT:   " + DNS_Packet_OUT.extraData);

			try {
				var foldertree = DNS_Packet_IN.question[0].data.split(".").reverse();
				var Directory = "./RAW";
				for (var a = 0; a < foldertree.length; a++)
					Directory += "/" + foldertree[a];
				Directory += "/" + JSON.stringify(new Date()).replace(/[^0-9T]/g, "");
				if (DNS_Packet_IN.extraData.length > 1)
					Directory += ".extradata";
				Directory += ".bin";
				Logger.saveThis(Directory, response);
			} catch (e) {}

			try {dns.lookup(DNS_Packet_IN.question[0].data, function () {});} catch (e) {}

			DNS_Packet_OUT.answer.forEach((a) => {
				for (var i = 0; i < NamethisObj; i++)
					if (NamethisObj[i][0] == a.data) {
						NamethisObj[i] = [a.data, a.size, a.qclass, a.qtype, now(), null];
						return;
					}
				NamethisObj.push([a.data, a.size, a.qclass, a.qtype, now(), null]);
			});

			DNS_Packet_OUT.namespace.forEach((a) => {
				for (var i = 0; i < NamethisObj; i++)
					if (NamethisObj[i][0] == a.data) {
						NamethisObj[i] = [a.data, a.size, a.qclass, a.qtype, now(), a.serialCode];
						return;
					}
				NamethisObj.push([a.data, a.size, a.qclass, a.qtype, now(), a.serialCode]);
			});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		}, function (err) {
			if (!(err === "Timeout"))
				console.log("Error:" + Buffer2DnsQuery(message).question + "|" + err);
		});
});
server.bind(PORT); //, HOST);





//	/**********************************************************************************************************************\
//	* DNS Client                                                                                                           *
//	* no need for introductions                                                                                            *
//	* https://nodejs.org/api/dgram.html#dgram_socket_send_msg_offset_length_port_address_callback                          *
//	\**********************************************************************************************************************/
var counterqueryidk=50000;
var UDPTemporarynamething = function(messg,callback,errorThis){
	if(!callback) return;
	if(!errorThis)
		errorThis=function(){};
	// A Client for forwarding msg
    var client = dgram.createSocket('udp4');
	
//	client.on('listening', function(){console.log(JSON.stringify(client.address()))});
	client.on('error', function(err){console.log(`server error:\n${err.stack}`);client.close();errorThis(err);});
    client.on('message',callback);
    client.bind(++counterqueryidk,function(){
		setTimeout(function(){client.close();client.removeAllListeners();errorThis("Timeout");},1000*30);
		client.send(messg,53,'10.8.0.20');//,function(err,bytes){if(err)return;console.log("wot\t"+JSON.stringify(bytes));server.send(msg, remote.port, remote.address);});
	});
	if(counterqueryidk >= 60000)
		counterqueryidk=50000;
	return client;
};

//	/**********************************************************************************************************************\
//	* A Logger   for stuff                                                                                                 *
//	*                                                                                                                      *
//	*                                                                                                                      *
//	\**********************************************************************************************************************/
	fs.mkdirTreeSync = function(path,lastfolder){
		path = path.split('/');
		lastpath=".";
		for(var a=0;a<path.length-(lastfolder?0:1);a++){
			try{fs.mkdirSync(lastpath=lastpath+"/"+path[a]);}catch(e){if(e.code != 'EEXIST')throw new Error(e);}
		}
		return;
	}

var Logger = new Object();
    Logger.folderoutput = function(){
	var datetime = JSON.stringify(new Date()).replace(/[^0-9T]/g,"");
	var LogFileOutput = "";
	LogFileOutput+=    datetime.substr(0,4);
	LogFileOutput+="/"+datetime.substr(4,2);
	LogFileOutput+="/"+datetime.substr(6,2);
	return [LogFileOutput,datetime];
};
    Logger.saveThis = function(directory,content){
		fs.mkdirTreeSync(directory,false);
		
		var quick;
		try{
			quick=fs.createWriteStream(directory);
		} catch(e){}
		try{
			quick.write(content);
		} catch(e){}
		try{
			quick.close();
		}catch(e){}
	}


//	/**********************************************************************************************************************\
//	* DNS PACKET DEASSEMBLER                                                                                               *
//	*                                                                                                                      *
//	* under development , yet                                                                                              *
//	\**********************************************************************************************************************/

// TODO : Learn class 

/* File: OBJ\DNSQuery.json */
var DNSQuery = {raw: new Buffer([]),header:{id:0,qr:false,opcode:0,aa:false,tc:false,rd:false,ra:false,auth:false,authdata:false,z:0,rcode:0,qdcount:0,ancount:0,nscount:0,arcount:0},question:[],answer:[],namespace:[]};

/* File: OBJ\DNScodes.json */

//	http://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml
//  https://tools.ietf.org/html/rfc6895
var DNSqtype = {1:'A',2:'NS',3:'MD',4:'MF',5:'CNAME',6:'SOA',7:'MB',8:'MG',9:'MR',10:'NULL',11:'WKS',12:'PTR',13:'HINFO',14:'MINFO',15:'MX',16:'TXT',28:'AAAA',255:'*'};

var DNSqclass = {0:"Reserved",1:'IN',2:"CS",3:"CH",4:"HS",254:"NONE",255:"ANY"};
var DNSqclassName = {0:"Reserved",1:'Internet',2:"CSNET",3:"Chaos",4:"Hesiod",254:"none",255:"*"};

var DNSrpcode = {0:"NOERROR",1:"FORMERR",2:"SERVFAIL",3:"NXDOMAIN",4:"NOTIMP",5:"REFUSED",6:"YXDOMAIN",7:"YXRRSET",8:"NXRRSET",9:"NOTAUTH",10:"NOTZONE",11:"SSOPNOTIMP",16:"BADVERS",16:"BADSIG",17:"BADKEY",18:"BADTIME",19:"BADMODE",20:"BADNAME",21:"BADALG",22:"BADTRUNC",23:"BADCOOKIE"};
var DNSrpcodeName = {0:"No Error",1:"Format Error",2:"Server Failure",3:"Non-Existent Domain",4:"Not Implemented",5:"Query Refused",6:"Name Exists when it should not",7:"RR Set Exists when it should not",8:"RR Set that should exist does not",9:"Server Not Authoritative for zone",10:"Name not contained in zone",16:"Bad OPT Version",6:"TSIG Signature Failure",17:"Key not recognized",18:"Signature out of time window",19:"Bad TKEY Mode",20:"Duplicate key name",21:"Algorithm not supported",22:"Bad Truncation",23:"Bad/missing Server Cookie"};

var DNSopcodeName = {0:"Query",1:"Inverse Query",2:"Status",4:"Notify",5:"Update"};

/*████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

function DnsQuery2Buffer(DNSQuery){    
    var BufferContent = [];
    BufferContent[0]=0;
	
	
	
	
	
    for(var a=0;a<BufferContent.length;a++)
		if(BufferContent[a] >= 256)
			return new Buffer(0);		
    return Buffer.from(BufferContent);
}
/*████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

// function qname2name(typeof Buffer){ return typeof String; }
var qname2name = function(qname,namefrom){  // cdn.syndication.twimg.com. -> 
	if(!namefrom)
		namefrom="";
    var domain=new String();
    var position=0;

	while(qname[position] != 0 && position < qname.length)	// you guys have no idea how to get mad ( psychological speaking )
		if(position+qname[position] < qname.length+1)
			domain=domain + qname.toString('utf8').substring(position+1,position+=qname[position]+1) + '.';
		else
			break;
	/*
	
	//domain=domain + qname.toString('utf8').substring(position+1,position+=qname[position]+1) + namefrom.slice(namefrom.length-(position+qname[position])-1,namefrom.length-1)
	*/
	return domain;
		
		
	if(position++ < qname.length){
		domain
		while(qname[position] != 0 && position < qname.length)	// you guys have no idea how to get mad ( psychological speaking )
			domain=domain + qname.toString('utf8').substring(position+1,position+=qname[position]+1) + '.';
		return domain;
	}
	return domain;
};

/*████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

// function name2qname(typeof String){ return typeof String; }
var name2qname = function(domain) {
    var tokens = domain.split(".");
    var qname = [];
    var offset = 0;
    for(var i=0; i<tokens.length;i++) {
        qname[offset++]=tokens[i].length;
        for(var j=0;j<tokens[i].length;j++) {
            qname[offset++] = tokens[i].charCodeAt(j);
        }
    }
    qname[offset] = 0;
    
    return Buffer.from(qname);
};

/*████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

// function Buffer2Number(typeof Buffer){ return typeof Number }
var Buffer2Number = function(input){
    input = input.reverse();
    var output=0;
    for(var a=input.length;a>0;a--){
        output+=input[a]<<(8*(a));
    }
    output+=input[0];
    return output;
}
// Buffer2Number(Buffer.from([0x00,0x00]));
// Buffer2Number(Buffer.from([0x00,0x01]));
// Buffer2Number(Buffer.from([0x00,0x09]));
// Buffer2Number(Buffer.from([0x00,0x0F]));
// Buffer2Number(Buffer.from([0x00,0x10]));
// Buffer2Number(Buffer.from([0x00,0xF0]));
// Buffer2Number(Buffer.from([0x01,0x00]));
// Buffer2Number(Buffer.from([0x01,0x01]));
// Buffer2Number(Buffer.from([0x01,0x04]));

// takes every INT8 in Buffer and convert to Number

/*████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

// function Number2Buffer(typeof Number){ return typeof Buffer }
var Number2Buffer = function(input,BufSize){
    var output=new Buffer(BufSize);
    output
    for(var a=input.length;a>0;a--){
        output+=input[a]<<(8*(a));
    }
    output+=input[0];
    return output;
}

// takes every INT8 in Buffer and convert to Number

/*████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

// function Number2Boolean(typeof Number){ return typeof Array[typeof Boolean, ... , typeof Boolean] }
var Number2Boolean = function(input,valueA,valueB){
    if(typeof input != 'number')
        return [];
    var output = [];
    var multiplier=0;
    
    while(1<<multiplier++ < input)
        output[multiplier-1]= (typeof valueA!= "undefined"?valueA:false);
    
    while(--multiplier>=0){
        if(input >= 1<<multiplier){
            input -= 1<<multiplier;
            output[multiplier] = (typeof valueB!= "undefined"?valueB:true);
        }
    }
    return output;
}

/*████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

// function Boolean2Number(typeof Array[typeof Boolean, ... , typeof Boolean]){ return typeof Number }
var Boolean2Number = function(input){
    if(typeof input != "object")
        return NaN;
    var output = 0;
    var multiplier=0;
    
    while(typeof input[multiplier] != 'undefined'){
        if(input[multiplier])output+=1<<multiplier;
        ++multiplier;
    }
    
    while(--multiplier>=0){
        if(input >= 1<<multiplier){
            input -= 1<<multiplier;
            output[multiplier] = (typeof valueB!= "undefined"?valueB:true);
        }
    }
    return output;
}

/*████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

/* File: DNS\Buffer2Query.js */

//	/**********************************************************************************************************************\
//	*    DNS Query Header Package / Packet is like this: ( each letter is a bit | divided in 8 bits = 1 Byte )             *
//	*                                                                                                                      *
//	*      8bit     8bit                                                                                                   *
//	*    AAAAAAAA AAAAAAAA                                                                                                 *
//	*    BCCCCDEF GHNOIIII                                                                                                 *
//	*    JJJJJJJJ JJJJJJJJ                                                                                                 *
//	*    KKKKKKKK KKKKKKKK                                                                                                 *
//	*    LLLLLLLL LLLLLLLL                                                                                                 *
//	*    MMMMMMMM MMMMMMMM                                                                                                 *
//	*    ######## ########                                                                                                 *
//	*                                                                                                                      *
//	*    A = INT16    Identification of the packet                                                                         *
//	*    B = BOOL     Query OR Response                                                                                    *
//	*    C = INT4     Question Code                                                                                        *
//	*    D = BOOL     Authority                                                                                            *
//	*    E = BOOL     Truncated                                                                                            *
//	*    F = BOOL     Recursion Desired                                                                                    *
//	*    G = BOOL     Recursion Avaliable                                                                                  *
//	*    H = ZERO     nothing. really                                                                                      *
//	*    N = BOOL     Answer authenticated (wireshark says that, idk)                                                      *
//	*    O = BOOL     Authentication Data (Again Wireshark)                                                                *
//	*    I = INT4     Response Code                                                                                        *
//	*    J = INT16    Amount of Questions                                                                                  *
//	*    K = INT16    Amount of Answers                                                                                    *
//	*    L = INT16    Amount of NS things                                                                                  *
//	*    M = INT16    Amount of AR things                                                                                  *
//	*    # = ????     Flexibe content depends on the J,K,L and M                                                           *
//	*                                                                                                                      *
//	*    details of more tecnical info here: https://tools.ietf.org/html/rfc1035#section-4.1.1                             *
//	*    details of more tecnical info here: https://tools.ietf.org/html/rfc6895#section-2                                 *
//	*                                                                                                                      *
//	*                                                                                                                      *
//	*    DNS Query Questions (J variable) Package or Section where the questions is at.                                    *
//	*    this place require explanation                                                                                    *
//	*                                                                                                                      *
//	*      8bit     8bit                                                                                                   *
//	*    NNNNNNNN OOOOOOOO                                                                                                 *
//	*    OOOOOOOO OOOOOOOO                                                                                                 *
//	*    OOOOOOOO OOOOOOOO                                                                                                 *
//	*    OOOOOOOO NNNNNNNN                                                                                                 *
//	*    OOOOOOOO OOOOOOOO                                                                                                 *
//	*    OOOOOOOO NNNNNNNN                                                                                                 *
//	*    PPPPPPPP PPPPPPPP                                                                                                 *
//	*	 QQQQQQQQ QQQQQQQQ                                                                                                 *
//	*                                                                                                                      *
//	*    N = INT8     The amount of next INT8 as CHARs to be in query                                                      *
//	*    O = INT8     Charactere in the table ASC8 ( or ASC7 , idk yet, go easy or claim your superiority in the comments section )
//	*    P = INT16    code of que requisition. 1 for A ( IPv4 ) , 5 for an alias ( Another name to search for ) , and others 256 codes possible
//	*    Q = INT16    idk , why this exist. why? if this thing is not 1 ( ONE ) it is not INTERNET related request.        *
//	*                                                                                                                      *
//	*    in the example there i put NOOOOOONOOONPPQQ order, why? look in the line below                                    *
//	*                               .GOOGLE.COM.          did you notice? N is . (dot) and the next O chars to be show     *
//	*    the first N is 0x06, means that the next bytes is chars which is OOOOOO or GOOGLE                                 *
//	*    then again is N with 0x03 saying the next OOO is chars. or COM                                                    *
//	*    the last N contais 0x00. no next chars, or end of the string to ask|query                                         *
//	*    P and Q is just class and type of the N and O Bytes type.                                                         *
//	*                                                                                                                      *
//	*                                                                                                                      *
//	*                                                                                                                      *
//	*                                                                                                                      *
//	*                                                                                                                      *
//	*                                                                                                                      *
//	*                                                                                                                      *
//	*                                                                                                                      *
//	*                                                                                                                      *
//	*    Vinicius Willer Alencar Haas 2016.12.26                                                                           *
//	*    Build for learning purposes,and have a Personal DNS Server.                                                       *
//	\**********************************************************************************************************************/

function Buffer2DnsQuery(req){    
    var sliceBits = function(b, off, len) {
        if(!len) len = off+1;
        var s = 7 - (off + len - 1);

        b = b >>> s;
        return b & ~(0xff << len);
    };

    var query = new Object(); //DNSQuery

    query.raw=req.toString("hex");
    
    var tmpSlice;
    var tmpByte;

	query.header={};
	
// Build Header
    query.header.id = Buffer2Number(req.slice(0,2));    // AAAAAAAA AAAAAAAA

    tmpSlice = req.slice(2,3);    // BCCCCDEF
    tmpByte = tmpSlice.toString('binary', 0, 1).charCodeAt(0);    
    query.header.qr = sliceBits(tmpByte, 0,1)?true:false;    // B
    query.header.opcode = sliceBits(tmpByte, 1,4);    // CCCC
    query.header.aa = sliceBits(tmpByte, 5,1)?true:false;    // D
    query.header.tc = sliceBits(tmpByte, 6,1)?true:false;    // E
    query.header.rd = sliceBits(tmpByte, 7,1)?true:false;    // F

    tmpSlice = req.slice(3,4); // GHNOIIII
    tmpByte = tmpSlice.toString('binary', 0, 1).charCodeAt(0);    
    query.header.ra		= sliceBits(tmpByte, 0,1)?true:false; // G
    query.header.z		= sliceBits(tmpByte, 1,1); // H
    query.header.auth	= sliceBits(tmpByte, 2,1)?true:false; // N
    query.header.authdata = sliceBits(tmpByte, 3,1)?true:false; // O
    query.header.rcode = sliceBits(tmpByte, 4,4); // IIII
	
    query.header.qdcount = Buffer2Number(req.slice(4,6)); // JJJJJJJJ JJJJJJJJ
    query.header.ancount = Buffer2Number(req.slice(6,8)); // KKKKKKKK KKKKKKKK
    query.header.nscount = Buffer2Number(req.slice(8,10)); // LLLLLLLL LLLLLLLL
    query.header.arcount = Buffer2Number(req.slice(10, 12)); // MMMMMMMM MMMMMMMM
    
// pointer to gather a range of buffer data 	
    var position=12;
	
// Simple resolver to a human comprehension(?)
	var resolveDataThing = function(qtype,dataThing,extrapayloadthing){
		if(!extrapayloadthing)
			extrapayloadthing = "";
    	switch(qtype){
			case  1:	/*IPv4 */		return ""+dataThing[0]+"."+dataThing[1]+"."+dataThing[2]+"."+dataThing[3]+"";break;
			case  5:	/*CNAME*/		return qname2name(dataThing,extrapayloadthing);break;
			case  6:	/* SOA */		return qname2name(dataThing,extrapayloadthing);break;	// special snowflake,multiple responses in a buffer create qnameSOA2String()
			case 12:	/* PTR */		return qname2name(dataThing,extrapayloadthing);break;
			case 28:	/*IPv6 */		return (function(input){var output="";for(var ip=0;ip<16;ip++)output+=((ip+1)%2?";":"")+(input[ip]<10?"0":"")+input[ip].toString(16);return output.replace(";","");namefrom.length})(dataThing);
			default:	/* IDK */		return dataThing;break;
		}
		return dataThing;
	}
	

// Gathering Questions
	query.question=[];
    var amount = query.header.qdcount;
    for(var q=0;q<amount;q++){
		if(req.length < position)break; // dies if overflow, unstable code protection or random bullshit
        var lastposition=position;
		
		var question = new Object;
		
        while(req[position++] != 0 && position < req.length);	// mark between the first N and the last N		
		question.data = resolveDataThing(5,req.slice(lastposition, position));
		question.qtype = Buffer2Number(req.slice(position, position+=2))
		question.qclass = Buffer2Number(req.slice(position, position+=2))

//		question.data = resolveDataThing(question.qtype,code,"");
		
		query.question[q] = question;
    }
	
// Gathering Answers TODO: understando those ████ers. i dont get it, and it is wasting my hobby time with this shiet
// https://tools.ietf.org/html/rfc1035#section-4.1.3
	query.answer=[];
    var amount = query.header.ancount;
    for(var a=0;a<amount;a++){
		if(req.length < position)break; // dies if overflow, unstable code protection or random bullshit
		
		var answer = new Object;
		
		answer.code = Buffer2Number(req.slice(position, position+=2));
		answer.qtype = Buffer2Number(req.slice(position, position+=2));
		answer.qclass = Buffer2Number(req.slice(position, position+=2));
		answer.TTL = Buffer2Number(req.slice(position, position+=4));
		answer.size = size = Buffer2Number(req.slice(position,position+=2));
		answer.data = resolveDataThing(answer.qtype,req.slice(position,position+=size),query.question[0].data);

		query.answer[a] = answer;
	}
	
// Gathering Answers / Authoritative nameservers
// TODO: URL HERE
	query.namespace=[];
    var amount = query.header.nscount;
    for(var n=0;n<amount;n++){
		if(req.length < position)break; // dies if overflow, unstable code protection or random bullshit
		
		var namespace = new Object;
		
        namespace.code = Buffer2Number(req.slice(position, position+=2));
        namespace.qtype = qtype = Buffer2Number(req.slice(position, position+=2));
        namespace.qclass = Buffer2Number(req.slice(position, position+=2));
        namespace.TTL = Buffer2Number(req.slice(position, position+=4));
        namespace.size = size = Buffer2Number(req.slice(position, position+=2));
		namespace.size+=-20;
		namespace.data = resolveDataThing(qtype,req.slice(position,position+=size-20),query.question[0].data); // no need to remember position now. learned a easy way of doing it.
        namespace.serialCode = Buffer2Number(req.slice(position, position+=4));
        namespace.RefreshInterval = Buffer2Number(req.slice(position, position+=4));
        namespace.RetryInterval = Buffer2Number(req.slice(position, position+=4));
        namespace.Expiration = Buffer2Number(req.slice(position, position+=4));
        namespace.minimunTTL = Buffer2Number(req.slice(position, position+=4));

		query.namespace[n] = namespace;
	}
	
	// Aditional will be required
	query.extraData = req.slice(position, req.length);
	
    return query;
}
//var testmsg = Buffer.from([0xbb,0x63,0x81,0x80,0x01,0x00,0x08,0x00,0x00,0x00,0x00,0x00,0x03,0x74,0x6d,0x73,0x08,0x74,0x72,0x75,0x6f,0x70,0x74,0x69,0x6b,0x03,0x63,0x6f,0x6d,0x00,0x01,0x00,0x01,0x00,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0x43,0xcd,0x87,0x6e,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0x9f,0xcb,0xb0,0x86,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0x9f,0xcb,0xb0,0x7f,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0xc0,0xf1,0x8f,0x43,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0xc6,0xc7,0x50,0xa4,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0xc6,0xc7,0x4b,0x8d,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0x43,0xcd,0x87,0x92,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0x9f,0xcb,0xbc,0x68]);

//console.log(Buffer2DnsQuery(testmsg));
