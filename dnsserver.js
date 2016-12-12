lastquery = {};

/* File: DNS\DNS_SRV_Daemon.js */

var PORT = 53;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});
lastquery = {};

server.on('message', function (message, remote) {
	console.log(Buffer.from(message));
	var DnsQuery = Buffer2DnsQuery(message);
	/*
	var answer=[];
	for(var a=0;DnsQuery.question.length;a++)
		answer[a] = searchFunction(DnsQuery.question[a]);
	//TODO remove repeated answers AKA remove redundancies(?).
	
	
	*/
});
server.bind(PORT, HOST);

/* File: OBJ\Query.json */

var DNSQuery = {raw: new Buffer([]),header:{id:0,qr:false,opcode:0,aa:false,tc:false,rd:false,ra:false,z:0,rcode:0,qdcount:0,ancount:0,nscount:0,arcount:0},question:[],answer:[]};

/* File: DNS\Buffer_to_Query.js */

function Buffer2DnsQuery(req){	
	var sliceBits = function(b, off, len) {
		if(!len) len = off+1;
		var s = 7 - (off + len - 1);

		b = b >>> s;
		return b & ~(0xff << len);
	};
    
/**********************************************************************************************************************\
*	DNS Query Header Package / Packet is like this: ( each letter is a bit, divided in 8 bits = 1 Byte )
*	
*	AAAAAAAA AAAAAAAA
*	BCCCCDEF GHHHIIII
*	JJJJJJJJ JJJJJJJJ
*	KKKKKKKK KKKKKKKK
*	LLLLLLLL LLLLLLLL
*	MMMMMMMM MMMMMMMM
*	######## ########
*	
*	A = INT16	Identification of the packet
*	B = BOOL	Response
*	C = INT4	Question Code
*	D = BOOL	Authority
*	E = BOOL	Truncated
*	F = BOOL	Recursion Desired
*	G = BOOL	Recursion Avaliable
*	H = ZERO	nothing. really
*	I = INT4	Response Code
*	J = INT16	Amount of Questions
*	K = INT16	Amount of Answers
*	L = INT16	Amount of NSthing
*	M = INT16	Amount of ARThing
*	# = ????	Flexibe content depends on the J,K,L and M
*	
*	details of more tecnical info here: https://tools.ietf.org/html/rfc1035#section-4.1.1
\**********************************************************************************************************************/
    var query = new Object(DNSQuery);

	const query.raw=req;
	
    var tmpSlice;
    var tmpByte;

    query.header.id = Buffer2Number(req.slice(0,2));	// AAAAAAAA

    tmpSlice = req.slice(2,3);	// BCCCCDEF
    tmpByte = tmpSlice.toString('binary', 0, 1).charCodeAt(0);
    
    query.header.qr = sliceBits(tmpByte, 0,1)?true:false;	// B
    query.header.opcode = sliceBits(tmpByte, 1,4);	// CCCC
    query.header.aa = sliceBits(tmpByte, 5,1)?true:false;	// D
    query.header.tc = sliceBits(tmpByte, 6,1)?true:false;	// E
    query.header.rd = sliceBits(tmpByte, 7,1)?true:false;	// F

    tmpSlice = req.slice(3,4); // GHHHIIII
    tmpByte = tmpSlice.toString('binary', 0, 1).charCodeAt(0);
    
    query.header.ra = sliceBits(tmpByte, 0,1)?true:false; // G
    query.header.z = sliceBits(tmpByte, 1,3); // HHH
    query.header.rcode = sliceBits(tmpByte, 4,4); // IIII
    query.header.qdcount = Buffer2Number(req.slice(4,6)); // JJJJJJJJ JJJJJJJJ
    query.header.ancount = Buffer2Number(req.slice(6,8)); // KKKKKKKK KKKKKKKK
    query.header.nscount = Buffer2Number(req.slice(8,10)); // LLLLLLLL LLLLLLLL
    query.header.arcount = Buffer2Number(req.slice(10, 12)); // MMMMMMMM MMMMMMMM
	
	/***\
	*	this is where things gets complicated 
	*	TODO: Explanation of this part
	\***/
	var lastposition=12
	var position=lastposition;
	
	for(var q=0;q<query.header.qdcount;q++){
		lastposition=position;
		query.question[q]={};
		while(req[position++] !== 0 && position < req.length);
		query.question[q].qname = qname2Name( req.slice(lastposition, position) );
		query.question[q].qtype = Buffer2Number(req.slice(position, position+2));
		query.question[q].qclass = Buffer2Number(req.slice(position+2, position+4));
		position+=4;
	}
	
	console.log(JSON.stringify(query));
	return lastquery = query;
}

/*████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

function DnsQuery2Buffer(DNSQuery){	
	var BufferContent = new Buffer()

}

/*████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████*/

// function qname2Name(typeof Buffer){ return typeof String; }
var qname2Name = function(qname){
	var domain=new String();
	var position=0;

	while(qname[position] != 0 && position < qname.length)	// FOR SOME ███████ REASON I WENT CRAZY HERE AND GOT STUCK INTO INFINITY HAVING TO REBOOT THIS SHIET
		domain=domain + qname.toString('utf8').substring(position+1,position+=qname[position]+1) + '.';

	return domain;
};
//       qname2Name(Buffer.from([0x06,0x67,0x6f,0x6f,0x67,0x6c,0x65,0x03,0x63,0x6f,0x6d,0x00]));
// copypaste into CLI to test      ^^   ^^   ^^   ^^   ^^   ^^   ^^   ^^   ^^   ^^   ^^   ^^
//                                 ◊    g    o    o    g    l    e    ◊    c    o    m    END

// ◊ = The Next N values are UTF8 Chars and ◊ replaced with a '.' ( dot )
// END = empty value meaning that there is ZERO UTF8 Chars

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
