//me has no idea where i am now, me need instructions.
// intended do be a server and client to DNS queries. receive from a server and forward as a client to another server.
// save the queries for furute use. you know.

/* File: DNS\DNS_SRV_Daemon.js */

// https://nodejs.org/api/dgram.html#dgram_socket_send_msg_offset_length_port_address_callback

var PORT = 53;
var HOST = '127.0.0.1';

if(!dgram)
    var dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});
lastquery = {};

server.on('message', function (message, remote) {
    console.log("####")
    // console.log(Buffer.from(message));
    var DnsQuery = Buffer2DnsQuery(message);
    
    console.log("network:\t{output:"+JSON.stringify({"host":HOST,"port":PORT})+",input:"+JSON.stringify(remote)+"}");
    console.log("header: \t"+JSON.stringify(DnsQuery.header));
    console.log("question:\t"+JSON.stringify(DnsQuery.question));
    console.log("answers:\t"+JSON.stringify(DnsQuery.answer));
    /*
    var answer=[];
    for(var a=0;DnsQuery.question.length;a++)
        answer[a] = searchFunction(DnsQuery.question[a]);
    //TODO remove repeated answers AKA remove redundancies(?).
    
    
    var Response = DNSQuery2Buffer(DNSQuery);
    */
	
	//server.send(message,remote.port,remote.address);
	
	
});


server.bind(PORT);//, HOST);


var counterqueryidk=50000;

var UDPTemporarynamething(msg,callback){
	// A Client for forwarding msg
    var client = dgram.createSocket('udp4');
	
	client.on('listening', function(){console.log(JSON.stringify(client.address()))});
	client.on('error', function(err){console.log(`server error:\n${err.stack}`);client.close();});
    client.on('message',function (msg,remota){
        //server.send(msg, remote.port, remote.address);
		var DnsQuerty = Buffer2DnsQuery(msg);
		
		console.log("####################");
		console.log("network:\t{output:"+JSON.stringify(client.address())+",input:"+JSON.stringify(remota)+"}");
		console.log("header: \t"+JSON.stringify(DnsQuerty.header));
		console.log("question:\t"+JSON.stringify(DnsQuerty.question));
		console.log("answers:\t"+JSON.stringify(DnsQuerty.answer));
		
		server.send(msg,remote.port,remote.address);
    });
    client.bind(++counterqueryidk,function(){
		setTimeout(function(){client.close();client.removeAllListeners();},1000*30);
		client.send(message,53,'10.8.0.20');//,function(err,bytes){if(err)return;console.log("wot\t"+JSON.stringify(bytes));server.send(msg, remote.port, remote.address);});
	});
	if(counterqueryidk >= 60000)
		counterqueryidk=50000;
};


/* File: OBJ\Query.json */
var DNSQuery = {raw: new Buffer([]),header:{id:0,qr:false,opcode:0,aa:false,tc:false,rd:false,ra:false,z:0,rcode:0,qdcount:0,ancount:0,nscount:0,arcount:0},question:[],answer:[]};
/* File: OBJ\qtype.json */
var DNSqtype = {1:'A',2:'NS',3:'MD',4:'MF',5:'CNAME',6:'SOA',7:'MB',8:'MG',9:'MR',10:'NULL',11:'WKS',12:'PTR',13:'HINFO',14:'MINFO',15:'MX',16:'TXT',255:'*'};
var DNSqclass = {1:'IN'};

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
var qname2name = function(qname){
    var domain=new String();
    var position=0;

    while(qname[position] != 0 && position < qname.length)	// you guys have no idea how to get mad ( psychological speaking )
        domain=domain + qname.toString('utf8').substring(position+1,position+=qname[position]+1) + '.';

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
//	*    BCCCCDEF GHHHIIII                                                                                                 *
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
//	*    PPPPPPPP QQQQQQQQ                                                                                                 *
//	*                                                                                                                      *
//	*    N = INT8     The amount of next INT8 as CHARs to be in query                                                      *
//	*    O = INT8     Charactere in the table ASC8 ( or ASC7 , idk yet, go easy or claim your superiority in the comments section )
//	*    P = INT8     code of que requisition. 1 for A ( IPv4 ) , 5 for an alias ( Another name to search for ) , and others 256 codes possible
//	*    Q = INT8     idk , why this exist. why? if this thing is not 1 ( ONE ) it is not INTERNET related request.        *
//	*                                                                                                                      *
//	*    in the example there i put NOOOOOONOOONPQ order, why? look in the line below                                      *
//	*                               .GOOGLE.COM.          did you notice? N is . (dot) the next O chars to be show         *
//	*    the first N is 0x06, means that the next bytes is chars which is OOOOOO                                           *
//	*    then again is N with 0x03 saying the next OOO is chars.                                                           *
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

    query.raw=req;
    
    var tmpSlice;
    var tmpByte;

// Build Header
    query.header.id = Buffer2Number(req.slice(0,2));    // AAAAAAAA

    tmpSlice = req.slice(2,3);    // BCCCCDEF
    tmpByte = tmpSlice.toString('binary', 0, 1).charCodeAt(0);
    
    query.header.qr = sliceBits(tmpByte, 0,1)?true:false;    // B
    query.header.opcode = sliceBits(tmpByte, 1,4);    // CCCC
    query.header.aa = sliceBits(tmpByte, 5,1)?true:false;    // D
    query.header.tc = sliceBits(tmpByte, 6,1)?true:false;    // E
    query.header.rd = sliceBits(tmpByte, 7,1)?true:false;    // F

    tmpSlice = req.slice(3,4); // GHHHIIII
    tmpByte = tmpSlice.toString('binary', 0, 1).charCodeAt(0);
    
    query.header.ra = sliceBits(tmpByte, 0,1)?true:false; // G
    query.header.z = sliceBits(tmpByte, 1,3); // HHH
    query.header.rcode = sliceBits(tmpByte, 4,4); // IIII
    query.header.qdcount = Buffer2Number(req.slice(4,6)); // JJJJJJJJ JJJJJJJJ
    query.header.ancount = Buffer2Number(req.slice(6,8)); // KKKKKKKK KKKKKKKK
    query.header.nscount = Buffer2Number(req.slice(8,10)); // LLLLLLLL LLLLLLLL
    query.header.arcount = Buffer2Number(req.slice(10, 12)); // MMMMMMMM MMMMMMMM
    
// pointer to gather a range of buffer data 	
    var lastposition=12
    var position=lastposition;
	
// Gathering Questions
    var amount = query.header.qdcount;
    for(var q=0;q<amount;q++){
        lastposition=position;
        query.question[q]={};
        while(req[position++] != 0 && position < req.length);	// mark between the first N and the last N
        query.question[q].name = qname2name( req.slice(lastposition, position) ); // Convert the info
        query.question[q].qtype = Buffer2Number(req.slice(position, position+2));
        query.question[q].type = DNSqtype[query.question[q].qtype];
        query.question[q].qclass = Buffer2Number(req.slice(position+2, position+4));
        position+=4;
    }
	
// Gathering Answers TODO: understando those ████ers. i dont get it and wasting my hobby time with this shiet
    var amount = query.header.ancount;
    for(var a=0;a<amount;a++){
		lastposition=position;
		query.answer[a]={};
        query.answer[a].code = req.slice(lastposition, position+2);
        query.answer[a].qtype = Buffer2Number(req.slice(lastposition+2, position+4));
        query.answer[a].qclass = Buffer2Number(req.slice(lastposition+4, position+6));
        query.answer[a].TTL = Buffer2Number(req.slice(lastposition+6, position+10));
        var size = Buffer2Number(req.slice(lastposition+10, position+12));
		AnswerData = req.slice(lastposition+12,position+12+size); // remember the position, redarted!
		position=(position+12+size);
		if(query.answer[a].qtype == 1){
			query.answer[a].data = ""+AnswerData[0]+"."+AnswerData[1]+"."+AnswerData[2]+"."+AnswerData[3]+"";
		}
	}
    return lastquery = query;
}
//some test captured from sniffer
// Buffer2DnsQuery(Buffer.from([0x3d,0xe5,0x81,0x80,0x00,0x01,0x00,0x04,0x00,0x00,0x00,0x00,0x03,0x77,0x77,0x77,0x0f,0x6d,0x73,0x66,0x74,0x63,0x6f,0x6e,0x6e,0x65,0x63,0x74,0x74,0x65,0x73,0x74,0x03,0x63,0x6f,0x6d,0x00,0x00,0x01,0x00,0x01,0xc0,0x0c,0x00,0x05,0x00,0x01,0x00,0x00,0x0c,0x10,0x00,0x13,0x06,0x76,0x34,0x6e,0x63,0x73,0x69,0x06,0x6d,0x73,0x65,0x64,0x67,0x65,0x03,0x6e,0x65,0x74,0x00,0xc0,0x35,0x00,0x05,0x00,0x01,0x00,0x00,0x00,0x0a,0x00,0x19,0x04,0x6e,0x63,0x73,0x69,0x08,0x34,0x2d,0x63,0x2d,0x30,0x30,0x30,0x33,0x08,0x63,0x2d,0x6d,0x73,0x65,0x64,0x67,0x65,0xc0,0x43,0xc0,0x54,0x00,0x05,0x00,0x01,0x00,0x00,0x00,0x0a,0x00,0x02,0xc0,0x59,0xc0,0x59,0x00,0x01,0x00,0x01,0x00,0x00,0x00,0x20,0x00,0x04,0x0d,0x6b,0x04,0x34]));
// Buffer2DnsQuery(Buffer.from([0x91,0x6d,0x81,0x80,0x00,0x01,0x00,0x05,0x00,0x00,0x00,0x00,0x06,0x63,0x6c,0x69,0x65,0x6e,0x74,0x03,0x77,0x6e,0x73,0x07,0x77,0x69,0x6e,0x64,0x6f,0x77,0x73,0x03,0x63,0x6f,0x6d,0x00,0x00,0x01,0x00,0x01,0xc0,0x0c,0x00,0x05,0x00,0x01,0x00,0x00,0x0a,0xa4,0x00,0x23,0x03,0x77,0x6e,0x73,0x06,0x6e,0x6f,0x74,0x69,0x66,0x79,0x07,0x77,0x69,0x6e,0x64,0x6f,0x77,0x73,0x03,0x63,0x6f,0x6d,0x06,0x61,0x6b,0x61,0x64,0x6e,0x73,0x03,0x6e,0x65,0x74,0x00,0xc0,0x34,0x00,0x05,0x00,0x01,0x00,0x00,0x00,0x26,0x00,0x0c,0x09,0x61,0x6d,0x65,0x72,0x69,0x63,0x61,0x73,0x31,0xc0,0x38,0xc0,0x63,0x00,0x05,0x00,0x01,0x00,0x00,0x00,0x29,0x00,0x06,0x03,0x62,0x6e,0x32,0xc0,0x34,0xc0,0x7b,0x00,0x05,0x00,0x01,0x00,0x00,0x00,0x2a,0x00,0x0b,0x08,0x62,0x6e,0x32,0x77,0x6e,0x73,0x31,0x62,0xc0,0x13,0xc0,0x8d,0x00,0x01,0x00,0x01,0x00,0x00,0x01,0x95,0x00,0x04,0x41,0x34,0x6c,0xfe]));
