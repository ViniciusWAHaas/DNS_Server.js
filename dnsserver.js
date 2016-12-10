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

server.on('message', function (message, remote) {
	console.log(Buffer.from(message));
	var DnsQuery = BufferToDnsQuery(message);
	/*
	var answer=[];
	for(var a=0;DnsQuery.question.length;a++)
		answer[a] = searchFunction(DnsQuery.question[a]);
	//TODO remove repeated answers AKA remove redundancies(?).
	*/
	
});
server.bind(PORT, HOST);

/* File: DNS\Buffer_to_Query.js */

function BufferToDnsQuery(req){	
	var sliceBits = function(b, off, len) {
		var s = 7 - (off + len - 1);

		b = b >>> s;
		return b & ~(0xff << len);
	};
    
    var query = new Object();
    query.header = {};
    query.question = [];

    var tmpSlice;
    var tmpByte;
    //transaction id
    // 2 bytes
    query.header.id = Buffer2Number(req.slice(0,2));

    //slice out a byte for the next section to dice into binary.
    tmpSlice = req.slice(2,3);
    //convert the binary buf into a string and then pull the char code
    //for the byte
    tmpByte = tmpSlice.toString('binary', 0, 1).charCodeAt(0);
    
    //qr
    // 1 bit
    query.header.qr = sliceBits(tmpByte, 0,1);
    //opcode
    // 0 = standard, 1 = inverse, 2 = server status, 3-15 reserved
    // 4 bits
    query.header.opcode = sliceBits(tmpByte, 1,4);
    //authorative answer
    // 1 bit
    query.header.aa = sliceBits(tmpByte, 5,1);
    //truncated
    // 1 bit
    query.header.tc = sliceBits(tmpByte, 6,1);
    //recursion desired
    // 1 bit
    query.header.rd = sliceBits(tmpByte, 7,1);

    //slice out a byte to dice into binary
    tmpSlice = req.slice(3,4);
    //convert the binary buf into a string and then pull the char code
    //for the byte
    tmpByte = tmpSlice.toString('binary', 0, 1).charCodeAt(0);
    
    //recursion available
    // 1 bit
    query.header.ra = sliceBits(tmpByte, 0,1);

    //reserved 3 bits
    // rfc says always 0
    query.header.z = sliceBits(tmpByte, 1,3);

    //response code
    // 0 = no error, 1 = format error, 2 = server failure
    // 3 = name error, 4 = not implemented, 5 = refused
    // 6-15 reserved
    // 4 bits
    query.header.rcode = sliceBits(tmpByte, 4,4);

    //question count
    // 2 bytes
    query.header.qdcount = Buffer2Number(req.slice(4,6));
    //answer count
    // 2 bytes
    query.header.ancount = Buffer2Number(req.slice(6,8));
    //ns count
    // 2 bytes
    query.header.nscount = Buffer2Number(req.slice(8,10));
    //addition resources count
    // 2 bytes
    query.header.arcount = Buffer2Number(req.slice(10, 12));
    
	query.questio = {};
    query.questio.qname = req.slice(12, req.length - 4);
    //qtype
    query.questio.qtype = req.slice(req.length - 4, req.length - 2);
    //qclass
    query.questio.qclass = req.slice(req.length - 2, req.length);
	
    //qname is the sequence of domain labels
    //assuming one question
    //qname length is not fixed however it is 4
    //octets from the end of the buffer
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

var Buffer2Number = function(input){
	input = input.reverse();
	var output=0;
	for(var a=input.length;a>0;a--){
		output+=input[a]<<(8*(a));
	}
	output+=input[0];
	return output;
}
