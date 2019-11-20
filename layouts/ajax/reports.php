<?php
header('Content-Type: application/json');
set_include_path($_SERVER["DOCUMENT_ROOT"].'/include_path');
session_start();
session_regenerate_id();
require_once 'queries.php';
setlocale (LC_TIME, "it_IT");

$q = new Queries();

// $reportId = filter_input(REQ, 'reportId');
$reportId = filter_input(INPUT_REQUEST, 'reportId');
$result = $q->getDatamartData($reportId);

ob_clean();
echo json_encode($result, JSON_FORCE_OBJECT);
