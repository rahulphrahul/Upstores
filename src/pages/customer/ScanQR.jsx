import React, { useEffect, useRef, useState } from "react";
import { Container, Card, Alert, Button } from "react-bootstrap";
import { QrCode, Camera } from "@phosphor-icons/react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

const ScanQR = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);

  const [permissionState, setPermissionState] = useState("checking");
  const [error, setError] = useState(null);

  const startScanner = () => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.shop_id) {
              if (isRunningRef.current) {
                scanner.stop().then(() => {
                  isRunningRef.current = false;
                  navigate(`customer/shop/${data.shop_id}`);
                });
              }
            } else {
              setError("Invalid shop QR code");
            }
          } catch {
            setError("Unsupported QR format");
          }
        }
      )
      .then(() => {
        isRunningRef.current = true;
      })
      .catch(() => {
        setPermissionState("denied");
        setError("Camera access denied");
      });
  };

  const checkPermission = async () => {
    try {
      const result = await navigator.permissions.query({
        name: "camera",
      });

      setPermissionState(result.state);

      if (result.state === "granted" || result.state === "prompt") {
        startScanner();
      }

      result.onchange = () => {
        setPermissionState(result.state);
      };
    } catch {
      // Fallback for Safari
      startScanner();
    }
  };

  useEffect(() => {
    checkPermission();

    return () => {
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current.stop().catch(() => {});
        isRunningRef.current = false;
      }
    };
  }, []);

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="text-center">
          <QrCode size={48} className="mb-3 text-primary" />
          <h5>Scan Shop QR</h5>

          {permissionState === "denied" && (
            <Alert variant="danger">
              Camera permission denied.<br />
              Please allow camera access from browser settings.
            </Alert>
          )}

          {error && <Alert variant="warning">{error}</Alert>}

          {permissionState === "denied" && (
            <Button
              variant="primary"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              <Camera size={18} className="me-2" />
              Retry After Allowing Camera
            </Button>
          )}

          <div
            id="qr-reader"
            style={{
              width: "100%",
              marginTop: "20px",
              display: permissionState === "denied" ? "none" : "block",
            }}
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ScanQR;
