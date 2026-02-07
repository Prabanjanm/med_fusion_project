// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuditLog {
    struct LogEntry {
        string actionType;
        string recordHash;
        uint256 timestamp;
    }

    LogEntry[] public logs;

    event LogAdded(string actionType, string recordHash, uint256 timestamp);

    function addLog(string memory actionType, string memory recordHash) public {
        logs.push(LogEntry(actionType, recordHash, block.timestamp));
        emit LogAdded(actionType, recordHash, block.timestamp);
    }

    function getLog(uint256 index) public view returns (
        string memory,
        string memory,
        uint256
    ) {
        LogEntry memory l = logs[index];
        return (l.actionType, l.recordHash, l.timestamp);
    }

    function totalLogs() public view returns (uint256) {
        return logs.length;
    }
}
