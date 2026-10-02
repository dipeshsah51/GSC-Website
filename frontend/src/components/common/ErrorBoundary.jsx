import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("GSC App Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "50px 20px",
            maxWidth: "600px",
            margin: "60px auto",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(7, 23, 39, 0.1)",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "rgba(215, 169, 40, 0.15)",
              color: "#b8860b",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            !
          </div>
          <h2 style={{ color: "#071727", marginBottom: "10px" }}>
            Something went wrong while displaying this section
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "20px" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px",
              background: "#0b1f33",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
