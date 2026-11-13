package com.payafrica.config;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus; import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<?> handleIllegal(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));}
    @ExceptionHandler(DataAccessException.class) public ResponseEntity<?> handleDb(DataAccessException e){
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error","Base de données temporairement indisponible — votre commande reste en PENDING_PAYMENT, réessayez dans 30 secondes. Détails: "+e.getMostSpecificCause().getMessage()));
    }
    @ExceptionHandler(org.springframework.transaction.CannotCreateTransactionException.class) public ResponseEntity<?> handleTx(org.springframework.transaction.CannotCreateTransactionException e){
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error","Connexion DB perdue — paiement non débité, commande conservée en attente. Réessayez: POST /api/v1/orders/{id}/retry"));
    }
    @ExceptionHandler(Exception.class) public ResponseEntity<?> handleGeneric(Exception e){e.printStackTrace(); return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()!=null? e.getMessage():"Erreur interne"));}
}
