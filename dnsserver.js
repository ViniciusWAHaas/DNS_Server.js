//FOR LEARNING PURPOSES Thanks to https://github.com/sh1mmer/dnsserver.js
// aaaayyy lmao.
// disasemble and interpret a inbound UDP Packet into a DNS Query
// todo: a answer for it. idk how do i do it.

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
	TestedeMSG(message);
});
server.bind(PORT, HOST);

lastquery = {};

function TestedeMSG(req){	
	var sliceBits = function(b, off, len) {
		var s = 7 - (off + len - 1);

		b = b >>> s;
		return b & ~(0xff << len);
	};
    
    var query = new Object();
    query.header = {};
    //TODO write code to break questions up into an array
    query.question = [];

    var tmpSlice;
    var tmpByte;
        
    //transaction id
    // 2 bytes
    query.header.id = req.slice(0,2);

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
    query.header.qdcount = req.slice(4,6);
    //answer count
    // 2 bytes
    query.header.ancount = req.slice(6,8);
    //ns count
    // 2 bytes
    query.header.nscount = req.slice(8,10);
    //addition resources count
    // 2 bytes
    query.header.arcount = req.slice(10, 12);
    
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
	
	for(var q=0;q<=query.header.qdcount;q++){
		lastposition=position;
		query.question[q]={};
		while(req[position++] !== 0 && position < req.length);
		query.question[q].qname = qnameToName(req.slice(lastposition, position));
		query.question[q].qtype = req.slice(position, position+2);
		query.question[q].qclass = req.slice(position+2, position+4);
		position+=4;
	}
		
	
	console.log(JSON.stringify(query));
	return lastquery = query;
}

//TODO this doesnt work

var qnameToName = function(qname){
	var domain= '';
	var position=0;
	domain+=qname.substring(position+1,position+=qname[position]);
	for(var i=0;i<qname.length;i++){
		if (qname[i] == 0) {domain = domain.substring(0, domain.length - 1);break;}
		var tmpBuf = qname.slice(i+1, i+qname[i]+1);
		domain += tmpBuf.toString('binary', 0, tmpBuf.length);
		domain += '.';        
		i = i + qname[i];
	}
	return domain;
};
