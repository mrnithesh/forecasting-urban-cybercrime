"""
Flask API for Urban Cybercrime Forecasting Dashboard

This API provides endpoints for:
- Historical cybercrime incident data
- Prophet-based forecasts
- Regional and crime type statistics
- Data filtering and aggregation

"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_community.tools import DuckDuckGoSearchRun
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import SystemMessage

# Import the new agent components
from agent.graph import get_agent_graph
from agent.memory import session_memory

# Load environment variables
load_dotenv()

# Configure OpenRouter/OpenAI
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "xiaomi/mimo-v2-flash:free")

if not OPENROUTER_API_KEY:
    print("WARNING: OPENROUTER_API_KEY not found in environment variables. Chat functionality will not work.")

# Initialize LangGraph Agent via the new structure
try:
    print("Initializing Agent Graph...")
    agent_graph = get_agent_graph()
    print("Agent Graph initialized.")
except Exception as e:
    print(f"CRITICAL ERROR initializing agent graph: {e}")
    agent_graph = None

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from data_processor import data_processor, FRONTEND_CRIME_TYPES
from forecast_model import forecaster

# ============================================================================
# FLASK APP INITIALIZATION
# ============================================================================

app = Flask(__name__)

# Enable CORS for frontend integration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", "http://localhost:5000","http://localhost:8080"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})



data_initialized = False
initialization_error = None

def initialize_data():
    """Initialize data processor - called lazily on first API request"""
    global data_initialized, initialization_error
    
    if data_initialized:
        return True
    
    try:
        print("\n" + "=" * 70)
        print("INITIALIZING DATA PROCESSOR")
        print("=" * 70)
        
        # Process data
        data_processor.process_all_data()
        
        print("\n✓ Data processing complete")
        print("=" * 70 + "\n")
        
        data_initialized = True
        return True
        
    except Exception as e:
        initialization_error = str(e)
        print(f"\n✗ Error during data initialization: {e}")
        print("=" * 70 + "\n")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    # Health check endpoint
    return jsonify({
        'status': 'healthy',
        'message': 'Urban Cybercrime Forecasting API is running',
        'data_initialized': data_initialized
    })


@app.route('/api/regions', methods=['GET'])
def get_regions():
    """
    Get list of available regions/cities
    
    Returns:
        JSON array of region names
    """
    try:
        if not initialize_data():
            return jsonify({'error': f'Data initialization failed: {initialization_error}'}), 500
            
        regions = data_processor.get_available_regions()
        return jsonify(regions)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/crime-types', methods=['GET'])
def get_crime_types():
    """
    Get list of available crime types
    
    Returns:
        JSON array of crime type names
    """
    try:
        crime_types = data_processor.get_crime_types()
        return jsonify(crime_types)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    """
    Get historical incident data with optional filtering
    
    Query Parameters:
        region: City name or "All Regions" (default: "All Regions")
        crime_type: Specific crime type or "All Types" (default: "All Types")
        year: Specific year (e.g., "2024") or "all" (default: "all")
        format: "trend" for time series, "regional" for distribution, "crime-type" for breakdown
    
    Returns:
        JSON array of incident data
    """
    try:
        if not initialize_data():
            return jsonify({'error': f'Data initialization failed: {initialization_error}'}), 500
        
        region = request.args.get('region', 'All Regions')
        crime_type = request.args.get('crime_type', 'All Types')
        year = request.args.get('year', 'all')
        data_format = request.args.get('format', 'trend')
        
        # Get base data
        incidents = data_processor.get_incidents_by_region(region, year)
        
        if data_format == 'trend':
            # Time series format for incident trend chart
            if crime_type != 'All Types':
                # Filter by specific crime type
                result = incidents[['date', crime_type]].copy()
                result.rename(columns={crime_type: 'incidents'}, inplace=True)
            else:
                result = incidents[['date', 'incidents']].copy()
            
            # Convert to list of dicts
            return jsonify(result.to_dict('records'))
        
        elif data_format == 'crime-type':
            # Crime type distribution
            crime_totals = {}
            for crime in FRONTEND_CRIME_TYPES:
                if crime in incidents.columns:
                    crime_totals[crime] = int(incidents[crime].sum())
            
            # Format for recharts
            result = [{'type': k, 'count': v} for k, v in crime_totals.items()]
            
            # Filter by crime type if specified
            if crime_type != 'All Types':
                result = [r for r in result if r['type'] == crime_type]
            
            return jsonify(result)
        
        elif data_format == 'regional':
            # Regional distribution
            if region == 'All Regions':
                # Get data for each state (using the already filtered 'incidents' might be wrong for regional comparison if we pre-filtered by region?)
                # Actually, if region is 'All Regions', 'incidents' contains aggregated data over time.
                # To get regional breakdown, we need data per region.
                
                # So we need to iterate available regions and get their totals for the specific year
                states = [c for c in data_processor.get_available_regions() if c != 'All Regions']
                regional_data = []
                
                for state in states:
                    # Get data for this specific state and year
                    state_data = data_processor.get_incidents_by_region(state, year)
                    
                    if crime_type != 'All Types':
                        total = int(state_data[crime_type].sum())
                    else:
                        total = int(state_data['incidents'].sum())
                    
                    # Determine risk level (thresholds might need adjustment for yearly vs monthly vs all-time)
                    # Simple heuristic: adjust threshold based on number of months? 
                    # For now keep static thresholds or maybe adjust if year != 'all'
                    
                    if total > 3500:
                        risk = "High"
                    elif total > 2000:
                        risk = "Moderate"
                    else:
                        risk = "Low"
                    
                    regional_data.append({
                        'region': state,
                        'incidents': total,
                        'risk': risk
                    })
                
                return jsonify(regional_data)
            else:
                # Single region
                if crime_type != 'All Types':
                    total = int(incidents[crime_type].sum())
                else:
                    total = int(incidents['incidents'].sum())
                
                risk = "High" if total > 3500 else "Moderate" if total > 2000 else "Low"
                
                return jsonify([{
                    'region': region,
                    'incidents': total,
                    'risk': risk
                }])
        
        else:
            return jsonify({'error': 'Invalid format parameter'}), 400
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    """
    Get Prophet forecast data
    
    Query Parameters:
        region: City name or "All Regions" (default: "All Regions")
        periods: Number of months to forecast (default: 6)
        crime_type: Optional - forecast specific crime type
    
    Returns:
        JSON array with forecast data including actual, predicted, confidence intervals
    """
    try:
        if not initialize_data():
            return jsonify({'error': f'Data initialization failed: {initialization_error}'}), 500
        
        region = request.args.get('region', 'All Regions')
        periods = int(request.args.get('periods', 6))
        crime_type = request.args.get('crime_type', None)
        
        # Validate periods
        if periods < 1 or periods > 24:
            return jsonify({'error': 'Periods must be between 1 and 24'}), 400
        
        # Generate forecast
        if crime_type and crime_type != 'All Types':
            forecast_data = forecaster.forecast_by_crime_type(
                data_processor, crime_type, region, periods
            )
        else:
            forecast_data = forecaster.forecast_by_region(
                data_processor, region, periods
            )
        
        return jsonify(forecast_data)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """
    Get summary statistics
    
    Query Parameters:
        region: City name or "All Regions" (default: "All Regions")
        crime_type: Specific crime type or "All Types" (default: "All Types")
        year: Specific year or "all" (default: "all")
    
    Returns:
        JSON object with statistics
    """
    try:
        if not initialize_data():
            return jsonify({'error': f'Data initialization failed: {initialization_error}'}), 500
        
        region = request.args.get('region', 'All Regions')
        crime_type = request.args.get('crime_type', 'All Types')
        year = request.args.get('year', 'all')
        
        # Get incidents data
        incidents = data_processor.get_incidents_by_region(region, year)
        
        # Calculate total incidents
        if crime_type != 'All Types':
            total_incidents = int(incidents[crime_type].sum())
        else:
            total_incidents = int(incidents['incidents'].sum())
        
        # Find most common crime type
        crime_totals = {}
        for crime in FRONTEND_CRIME_TYPES:
            if crime in incidents.columns:
                crime_totals[crime] = int(incidents[crime].sum())
        
        most_common_type = max(crime_totals, key=crime_totals.get) if crime_totals else "Phishing"
        
        # Find top region (if showing all regions)
        if region == 'All Regions':
            states = [c for c in data_processor.get_available_regions() if c != 'All Regions']
            state_totals = {}
            
            for state in states:
                state_data = data_processor.get_incidents_by_region(state, year)
                state_totals[state] = int(state_data['incidents'].sum())
            
            top_region = max(state_totals, key=state_totals.get) if state_totals else "Maharashtra"
        else:
            top_region = region
        
        # Calculate risk level based on average monthly incidents
        avg_monthly = total_incidents / len(incidents) if len(incidents) > 0 else 0
        
        if avg_monthly > 1500:
            risk_level = "High"
        elif avg_monthly > 1000:
            risk_level = "Moderate"
        else:
            risk_level = "Low"
        
        # Get forecast summary (Forecasts always look ahead, usually ignoring past year filters for training, or maybe using filtered data?)
        # Typically forecasts are based on historical data up to now. 
        # If a specific past year is selected, forecasting might not make sense or should be "what was predicted then".
        # For simplicity, we keep forecast based on full history or just return empty if looking at past year?
        # Let's keep forecast based on full history for now as it's "future forecast".
        
        forecast_data = forecaster.forecast_by_region(data_processor, region, periods=6)
        forecast_summary = forecaster.get_forecast_summary(forecast_data)
        
        return jsonify({
            'totalIncidents': total_incidents,
            'mostCommonType': most_common_type if crime_type == 'All Types' else crime_type,
            'topRegion': top_region,
            'riskLevel': risk_level,
            'avgMonthly': int(avg_monthly),
            'forecast': forecast_summary
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/clear-cache', methods=['POST'])
def clear_cache():
    
    # Clear forecast cache (useful for development/testing)
    try:
        forecaster.clear_cache()
        return jsonify({'message': 'Cache cleared successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Chat endpoint using LangGraph Agent and OpenRouter with Session Memory
    """
    try:
        if not agent_graph:
            print("ERROR: Agent graph is None. Initialization failed.")
            return jsonify({'error': 'Chat agent not initialized correctly.'}), 500

        data = request.json
        user_message = data.get('message', '')
        # Simple session ID for now (IP-based or fixed demo ID)
        # In production, this would come from an auth token or cookie
        session_id = request.remote_addr or "demo_user"

        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        print(f"Chat request from {session_id}: {user_message}")

        # Retrieve history
        if not session_memory.session_exists(session_id):
            session_memory.create_session(session_id)
        
        # Get existing messages
        history = session_memory.get_history(session_id)
        
        # Run the agent
        try:
            # Prepare input state
            # Note: We don't append the new user message to history MANUALLY here if the graph handles it, 
            # but usually we pass the full history including the new message to the graph.
            
            # Create a HumanMessage for the new input
            from langchain_core.messages import HumanMessage
            new_msg = HumanMessage(content=user_message)
            
            # Combine history + new message
            messages_to_process = history + [new_msg]
            
            print("Invoking agent...")
            # Invoke the graph with the full message list
            result = agent_graph.invoke({"messages": messages_to_process})
            print("Agent execution successful.")
            
            # The result state contains the full updated list of messages (including tool calls, etc.)
            updated_messages = result["messages"]
            
            # Update session memory with the NEW messages only?
            # Or just replace the whole history with the updated state?
            # Replacing is safer to capture intermediate tool steps if we want them.
            # But our session_memory is append-only helper, let's just clear and set?
            # For simplicity in this implementation, let's just update our memory
            # with the difference or just store the latest state.
            
            # Actually, `session_memory` is a simple wrapper. Let's just update the internal list if we can,
            # or more simply: clear and re-add all messages from the graph state to stay in sync.
            session_memory.clear_session(session_id)
            for msg in updated_messages:
                session_memory.add_message(session_id, msg)
            
            # Extract the last message content which is the assistant's response
            response_text = updated_messages[-1].content
            print(f"Response length: {len(response_text)}")
            
        except Exception as e:
            print(f"CRITICAL: Agent execution error: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': f"Agent error: {str(e)}"}), 500

        return jsonify({
            'response': response_text,
            'sources': [] 
        })

    except Exception as e:
        print(f"CRITICAL: Chat endpoint outer error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500



@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500




if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("URBAN CYBERCRIME FORECASTING API")
    print("=" * 70)
    print("\nStarting Flask Development Server")
    print("\nAPI Endpoints:")
    print("  GET  /api/health          - Health check")
    print("  GET  /api/regions         - Available regions")
    print("  GET  /api/crime-types     - Available crime types")
    print("  GET  /api/incidents       - Historical incident data")
    print("  GET  /api/forecast        - Prophet forecasts")
    print("  GET  /api/stats           - Summary statistics")
    print("  POST /api/clear-cache     - Clear forecast cache")
    print("\n" + "=" * 70)
    print("\nAccess the API at: http://localhost:5000")
    print("Data will be loaded on first API request")
    print("=" * 70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
