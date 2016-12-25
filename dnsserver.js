
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const dns = require('dns');
const fs = require('fs');

/* File: DNS\DNS_SRV_Daemon.js */
// https://nodejs.org/api/dgram.html#dgram_socket_send_msg_offset_length_port_address_callback

var PORT = 53;
var HOST = '127.0.0.1';


var logoutput = fs.createWriteStream("./LOG_"+JSON.stringify(new Date()).replace(/[^0-9T]/g,"")+".json");

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});
lastquery = {};

server.on('message', function (message, remote) {
	new UDPTemporarynamething(message,function(response){
			
		console.log("\n####################");
		// console.log(Buffer.from(message));
		(function(){
			var DnsQuery = Buffer2DnsQuery(message);
			logoutput.write(JSON.stringify(DnsQuery) + "\n");
			
			console.log("header: \t"+JSON.stringify(DnsQuery.header));
			console.log("question:\t"+JSON.stringify(DnsQuery.question));
			console.log("answers:");
			DnsQuery.answer.forEach((a)=>{console.log("\t\t"+JSON.stringify(a));})
			console.log("answers:");
			DnsQuery.namespace.forEach((a)=>{console.log("\t\t"+JSON.stringify(a));})
			console.log("Extra:"+DnsQuery.extraData);
			
		})();
		
		/*
		var answer=[];
		for(var a=0;DnsQuery.question.length;a++)
			answer[a] = searchFunction(DnsQuery.question[a]);
		//TODO remove repeated answers AKA remove redundancies(?).
		
		
		var dasdf = DNSQuery2Buffer(DNSQuery);
		*/		
        //server.send(response, remote.port, remote.address);
		
		(function(){
			
			var DnsQuerty = Buffer2DnsQuery(response);
			logoutput.write(JSON.stringify(DnsQuerty) + "\n");
			
			console.log("####################");
			console.log("header: \t"+JSON.stringify(DnsQuerty.header));
			console.log("question:\t"+JSON.stringify(DnsQuerty.question));
			console.log("answers:");
			DnsQuerty.answer.forEach((a)=>{console.log("\t\t"+JSON.stringify(a));})
			console.log("answers:");
			DnsQuerty.namespace.forEach((a)=>{console.log("\t\t"+JSON.stringify(a));})
			console.log("Extra:"+DnsQuerty.extraData);
			
		})();
			
			
		logoutput.write("QResponse:"+response.toString("hex") + "\n");
		server.send(response,remote.port,remote.address);
		console.log("\n");
		console.log("IN PUT:"+message.toString('hex'));
		console.log("OUTPUT:"+response.toString('hex'));
			
	});
});


server.bind(PORT);//, HOST);

var counterqueryidk=50000;
var UDPTemporarynamething = function(messg,callback){
	// A Client for forwarding msg
    var client = dgram.createSocket('udp4');
	
	client.on('listening', function(){console.log(JSON.stringify(client.address()))});
	client.on('error', function(err){console.log(`server error:\n${err.stack}`);client.close();});
    client.on('message',function (msg,remota){callback(msg);});
    client.bind(++counterqueryidk,function(){
		setTimeout(function(){client.close();client.removeAllListeners();},1000*30);
		client.send(messg,53,'10.8.0.20');//,function(err,bytes){if(err)return;console.log("wot\t"+JSON.stringify(bytes));server.send(msg, remote.port, remote.address);});
	});
	if(counterqueryidk >= 60000)
		counterqueryidk=50000;
};

/*████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/
/*
var LoggerThingvars = [];
var LoggerThing(code,fn){
	LoggerThingvars[code]
}

/*████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

/* File: OBJ\DNSQuery.json */
var DNSQuery = {raw: new Buffer([]),header:{id:0,qr:false,opcode:0,aa:false,tc:false,rd:false,ra:false,auth:false,authdata:false,z:0,rcode:0,qdcount:0,ancount:0,nscount:0,arcount:0},question:[],answer:[],namespace:[]};

/* File: OBJ\DNScode.json */
var DNSqtype = {1:'A',2:'NS',3:'MD',4:'MF',5:'CNAME',6:'SOA',7:'MB',8:'MG',9:'MR',10:'NULL',11:'WKS',12:'PTR',13:'HINFO',14:'MINFO',15:'MX',16:'TXT',28:'AAAA',255:'*'};
var DNSqclass = {1:'IN'};//,"undef":"CH"}; CH = chaos 
var DNSopcode = {0:"NOERROR",1:"FORMERR",2:"SERVFAIL",3:"NXDOMAIN",4:"NOTIMP",5:"REFUSED",6:"YXDOMAIN",7:"YXRRSET",8:"NXRRSET",9:"NOTAUTH",10:"NOTZONE"};
var DNSrpcode = {0:"NOERROR",1:"FORMERR"                          ,4:"NOTIMP",5:"REFUSED"                                                              ,11:"SSOPNOTIMP"};

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
var qname2name = function(qname,namefrom){
    var domain=new String();
    var position=0;

    while(qname[position] != 0 && position < qname.length)	// you guys have no idea how to get mad ( psychological speaking )
		if(position+qname[position] < qname.length)
			domain=domain + qname.toString('utf8').substring(position+1,position+=qname[position]+1) + '.';
		else
			domain=domain + qname.toString('utf8').substring(position+1,position+=qname[position]+1) + namefrom.slice(namefrom.length-(position+qname[position]),namefrom.length) // + namefrom.slice(0-);

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
//	*    B = BOOL     Response                                                                                             *
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
//	*                                                                                                                      *
//	*                                                                                                                      *
//	*    DNS Query Questions Package or Section where the questions is at.                                                 *
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
//	*    in the example there i put NOOOOOONOOONPQ order, why? look in the line below                                      *
//	*                               .GOOGLE.COM.          did you notice? N is . (dot) and the next O chars to be show     *
//	*    the first N is 0x06, means that the next bytes is chars which is OOOOOO or GOOGLE                                 *
//	*    then again is N with 0x03 saying the next OOO is chars. or COM                                                    *
//	*    the last N contais 0x00. no next chars, OR end of the string to ask                                               *
//	*    P and Q is just class and type of the N and O Bytes type.                                                         *
//	\**********************************************************************************************************************/

lastquery = {};
function Buffer2DnsQuery(req){    
    var sliceBits = function(b, off, len) {
        if(!len) len = off+1;
        var s = 7 - (off + len - 1);

        b = b >>> s;
        return b & ~(0xff << len);
    };

    var query = new Object(DNSQuery);

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
		if(req.length < position)break;
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
		answer.data = resolveDataThing(answer.qtype,req.slice(position,position+=size),question.data[0]);

		query.answer[a] = answer;
	}
	
// Gathering Answers / Authoritative nameservers
// TODO: URL HERE
	query.namespace=[];
    var amount = query.header.nscount;
    for(var n=0;n<amount;n++){
		if(req.length < position)break;
		
		var namespace = new Object;
		
        namespace.code = Buffer2Number(req.slice(position, position+=2));
        namespace.qtype = Buffer2Number(req.slice(position, position+=2));
        namespace.qclass = Buffer2Number(req.slice(position, position+=2));
        namespace.TTL = Buffer2Number(req.slice(position, position+=4));
        namespace.size = Buffer2Number(req.slice(position, position+=2));
		namespace.size-=20;
		namespace.data = resolveDataThing(namespace.qtype,req.slice(position,position+=size),question.code[0]); // no need to remember position now. learned a easy way of doing it.
		
        namespace.serialCode = Buffer2Number(req.slice(position, position+=4));
        namespace.RefreshInterval = Buffer2Number(req.slice(position, position+=4));
        namespace.RetryInterval = Buffer2Number(req.slice(position, position+=4));
        namespace.Expiration = Buffer2Number(req.slice(position, position+=4));
        namespace.minimunTTL = Buffer2Number(req.slice(position, position+=4));

		query.namespace[n] = namespace;
	}
	
	// Aditional will be required
	query.extraData = req.slice(position, req.length);
	
    return lastquery = query;
}
// var testmsg = Buffer.from([0xbb,0x63,0x81,0x80,0x01,0x00,0x08,0x00,0x00,0x00,0x00,0x00,0x03,0x74,0x6d,0x73,0x08,0x74,0x72,0x75,0x6f,0x70,0x74,0x69,0x6b,0x03,0x63,0x6f,0x6d,0x00,0x01,0x00,0x01,0x00,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0x43,0xcd,0x87,0x6e,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0x9f,0xcb,0xb0,0x86,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0x9f,0xcb,0xb0,0x7f,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0xc0,0xf1,0x8f,0x43,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0xc6,0xc7,0x50,0xa4,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0xc6,0xc7,0x4b,0x8d,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0x43,0xcd,0x87,0x92,0x0c,0xc0,0x01,0x00,0x01,0x00,0x2e,0x00,0x00,0x00,0x04,0x00,0x9f,0xcb,0xbc,0x68]);

// Buffer2DnsQuery(testmsg)
