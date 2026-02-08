// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuditLogs {

    struct AuditEntry {
        string actionType;
        string recordHash;
        uint256 timestamp;
    }

    AuditEntry[] public logs;

    event AuditRecorded(
        string actionType,
        string recordHash,
        uint256 timestamp
    );

    function logAction(
        string memory actionType,
        string memory recordHash
    ) public {
        logs.push(
            AuditEntry(actionType, recordHash, block.timestamp)
        );
        emit AuditRecorded(actionType, recordHash, block.timestamp);
    }

    function getLog(uint256 index)
        public
        view
        returns (string memory, string memory, uint256)
    {
        AuditEntry memory e = logs[index];
        return (e.actionType, e.recordHash, e.timestamp);
    }

    function totalLogs() public view returns (uint256) {
        return logs.length;
    }
}
