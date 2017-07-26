#!/bin/bash

rm -rf /tmp/fabric-client-kvs_peerOrg*
mysql -uroot -proot < ./db/fabricexplorer.sql
node main.js >log.log 2>&1 &
