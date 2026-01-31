// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuditLogs {
    event LogRecorded(
        string action,
        string entity,
        uint256 timestamp
    );

    function logAction(string memory action, string memory entity) public {
        emit LogRecorded(action, entity, block.timestamp);
    }
}
